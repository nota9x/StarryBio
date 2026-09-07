import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GitHubAsset, GitHubRelease } from '../../scripts/updater/types';

import { verifyReleaseAttestations } from '../../scripts/updater/attestations';

const mocks = vi.hoisted(() => ({ verify: vi.fn(() => Promise.resolve()) }));
vi.mock('sigstore', () => ({ verify: mocks.verify }));

const digest = 'b'.repeat(64);
const commit = 'a'.repeat(40);
const asset: GitHubAsset = {
  browser_download_url: 'https://github.com/nota9x/StarryBio/releases/download/v4.0.0/update.tgz',
  digest: `sha256:${digest}`,
  id: 1,
  name: 'starrybio-update-v4.0.0.tgz',
  size: 123,
  state: 'uploaded',
};
const release: GitHubRelease = {
  assets: [asset],
  draft: false,
  id: 4,
  immutable: true,
  prerelease: false,
  published_at: '2026-01-01T00:00:00Z',
  tag_name: 'v4.0.0',
};

function bundle(statement: unknown) {
  return {
    content: {
      dsseEnvelope: {
        payload: Buffer.from(JSON.stringify(statement)).toString('base64'),
        payloadType: 'application/vnd.in-toto+json',
        signatures: [{ keyid: '', sig: 'AA==' }],
      },
    },
    mediaType: 'application/vnd.dev.sigstore.bundle.v0.3+json',
    verificationMaterial: {
      timestampVerificationData: { rfc3161Timestamps: [{ signedTimestamp: 'AA==' }] },
    },
  };
}

const releaseBundle = bundle({
  _type: 'https://in-toto.io/Statement/v1',
  predicate: {
    databaseId: '4',
    packageId: '1040423699',
    purl: 'pkg:github/nota9x/StarryBio@v4.0.0',
    repository: 'nota9x/StarryBio',
    repositoryId: '1040423699',
    tag: 'v4.0.0',
  },
  predicateType: 'https://in-toto.io/attestation/release/v0.2',
  subject: [
    {
      digest: { sha1: commit },
      uri: 'pkg:github/nota9x/StarryBio@v4.0.0',
    },
    { digest: { sha256: digest }, name: asset.name },
  ],
});
const provenanceBundle = bundle({
  _type: 'https://in-toto.io/Statement/v1',
  predicate: {
    buildDefinition: {
      buildType: 'https://actions.github.io/buildtypes/workflow/v1',
      externalParameters: {
        workflow: {
          path: '.github/workflows/release-please.yml',
          ref: 'refs/heads/main',
          repository: 'https://github.com/nota9x/StarryBio',
        },
      },
      resolvedDependencies: [
        {
          digest: { gitCommit: commit },
          uri: 'git+https://github.com/nota9x/StarryBio@refs/heads/main',
        },
      ],
      internalParameters: { github: { repository_id: '1040423699' } },
    },
  },
  predicateType: 'https://slsa.dev/provenance/v1',
  subject: [{ digest: { sha256: digest }, name: asset.name }],
});

function response(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  });
}

function fetcher(
  overrides: { duplicate?: boolean; provenance?: unknown; releaseAttestation?: unknown } = {}
): typeof fetch {
  return vi.fn((input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.includes('predicate_type=release')) {
      const item = {
        bundle_url: 'https://github.com/release-bundle.json',
        initiator: 'github',
        repository_id: 1_040_423_699,
      };
      return Promise.resolve(
        response({ attestations: overrides.duplicate ? [item, item] : [item] })
      );
    }
    if (url.includes('predicate_type=provenance')) {
      return Promise.resolve(
        response({
          attestations: [
            {
              bundle_url: 'https://github.com/provenance-bundle.json',
              initiator: 'user',
              repository_id: 1_040_423_699,
            },
          ],
        })
      );
    }
    if (url.endsWith('release-bundle.json')) {
      return Promise.resolve(response(overrides.releaseAttestation ?? releaseBundle));
    }
    if (url.endsWith('provenance-bundle.json')) {
      return Promise.resolve(response(overrides.provenance ?? provenanceBundle));
    }
    return Promise.reject(new Error(`Unexpected URL ${url}`));
  });
}

async function verify(fetchImplementation = fetcher()) {
  return verifyReleaseAttestations({
    asset,
    assetDigest: digest,
    commit,
    fetcher: fetchImplementation,
    githubTufRootPath: 'root.json',
    release,
    tufCachePath: 'cache',
  });
}

describe('cryptographic release policy', () => {
  beforeEach(() => mocks.verify.mockReset().mockResolvedValue(undefined));

  it('requires both GitHub release and SLSA attestations with pinned verifier identities', async () => {
    const evidence = await verify();
    expect(evidence.signerIdentity).toContain('release-please');
    expect(mocks.verify).toHaveBeenCalledTimes(2);
    const calls = mocks.verify.mock.calls as unknown[][];
    expect(calls[1]?.[1]).toMatchObject({
      certificateIssuer: 'https://token.actions.githubusercontent.com',
      ctLogThreshold: 1,
      tlogThreshold: 1,
    });
  });

  it('fails closed on signature/log verification failure', async () => {
    mocks.verify
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('invalid transparency proof'));
    await expect(verify()).rejects.toThrow('valid StarryBio build attestation');
  });

  it('rejects duplicate attestations', async () => {
    await expect(verify(fetcher({ duplicate: true }))).rejects.toThrow('exactly one');
  });

  it('rejects a signed release attestation with a mismatched repository identity', async () => {
    const mismatched = bundle({
      _type: 'https://in-toto.io/Statement/v1',
      predicate: {
        databaseId: '4',
        packageId: '999',
        purl: 'pkg:github/attacker/StarryBio@v4.0.0',
        repository: 'attacker/StarryBio',
        repositoryId: '999',
        tag: 'v4.0.0',
      },
      predicateType: 'https://in-toto.io/attestation/release/v0.2',
      subject: [
        {
          digest: { sha1: commit },
          uri: 'pkg:github/attacker/StarryBio@v4.0.0',
        },
        { digest: { sha256: digest }, name: asset.name },
      ],
    });
    await expect(verify(fetcher({ releaseAttestation: mismatched }))).rejects.toThrow(
      'release attestation'
    );
  });

  it('rejects a release attestation replayed for another tag commit', async () => {
    const replayed = bundle({
      _type: 'https://in-toto.io/Statement/v1',
      predicate: {
        databaseId: '4',
        packageId: '1040423699',
        purl: 'pkg:github/nota9x/StarryBio@v4.0.0',
        repository: 'nota9x/StarryBio',
        repositoryId: '1040423699',
        tag: 'v4.0.0',
      },
      predicateType: 'https://in-toto.io/attestation/release/v0.2',
      subject: [
        {
          digest: { sha1: 'c'.repeat(40) },
          uri: 'pkg:github/nota9x/StarryBio@v4.0.0',
        },
        { digest: { sha256: digest }, name: asset.name },
      ],
    });
    await expect(verify(fetcher({ releaseAttestation: replayed }))).rejects.toThrow(
      'release attestation'
    );
  });

  it('rejects replayed provenance with the wrong commit or ref', async () => {
    const replayed = bundle({
      _type: 'https://in-toto.io/Statement/v1',
      predicate: { source: 'refs/heads/evil', commit: 'c'.repeat(40) },
      predicateType: 'https://slsa.dev/provenance/v1',
      subject: [{ digest: { sha256: digest }, name: asset.name }],
    });
    await expect(verify(fetcher({ provenance: replayed }))).rejects.toThrow('build attestation');
  });

  it.each([
    ['repository', 'https://github.com/attacker/StarryBio', 'refs/heads/main', commit],
    ['workflow ref', 'https://github.com/nota9x/StarryBio', 'refs/heads/evil', commit],
    ['source commit', 'https://github.com/nota9x/StarryBio', 'refs/heads/main', 'c'.repeat(40)],
  ])(
    'rejects a signed provenance with the wrong %s',
    async (_name, repository, ref, sourceCommit) => {
      const mismatched = bundle({
        _type: 'https://in-toto.io/Statement/v1',
        predicate: {
          buildDefinition: {
            buildType: 'https://actions.github.io/buildtypes/workflow/v1',
            externalParameters: {
              workflow: {
                path: '.github/workflows/release-please.yml',
                ref,
                repository,
              },
            },
            internalParameters: { github: { repository_id: '1040423699' } },
            resolvedDependencies: [
              {
                digest: { gitCommit: sourceCommit },
                uri: `git+${repository}@${ref}`,
              },
            ],
          },
        },
        predicateType: 'https://slsa.dev/provenance/v1',
        subject: [{ digest: { sha256: digest }, name: asset.name }],
      });
      await expect(verify(fetcher({ provenance: mismatched }))).rejects.toThrow(
        'build attestation'
      );
    }
  );
});
