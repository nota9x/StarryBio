import path from 'node:path';
import { verify, type Bundle } from 'sigstore';
import { sha256 } from './filesystem';
import { fetchAttestationBundle, listAttestations, type AttestationReference } from './github';
import {
  TRUST_POLICY,
  type GitHubAsset,
  type GitHubRelease,
  type VerificationEvidence,
} from './types';

interface StatementSubject {
  digest?: Record<string, string>;
  name?: string;
  uri?: string;
}

interface InTotoStatement {
  _type?: string;
  predicate?: unknown;
  predicateType?: string;
  subject?: StatementSubject[];
}

interface ReleasePredicate {
  databaseId?: string;
  packageId?: string;
  purl?: string;
  repository?: string;
  repositoryId?: string;
  tag?: string;
}

interface ProvenancePredicate {
  buildDefinition?: {
    buildType?: string;
    externalParameters?: {
      workflow?: { path?: string; ref?: string; repository?: string };
    };
    internalParameters?: { github?: { repository_id?: string } };
    resolvedDependencies?: Array<{ digest?: Record<string, string>; uri?: string }>;
  };
}

const STATEMENT_TYPE = 'https://in-toto.io/Statement/v1';

function parseStatement(bundle: unknown): InTotoStatement {
  const value = bundle as {
    content?: { dsseEnvelope?: { payload?: string } };
    dsseEnvelope?: { payload?: string };
  };
  const envelope = value.dsseEnvelope ?? value.content?.dsseEnvelope;
  if (!envelope?.payload) throw new Error('Attestation does not contain a DSSE statement.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8'));
  } catch (error) {
    throw new Error('Attestation statement is malformed.', { cause: error });
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('Attestation statement is invalid.');
  return parsed;
}

function subjectMatches(statement: InTotoStatement, name: string, digest: string): boolean {
  return Boolean(
    statement.subject?.some(
      (subject) => subject.name === name && subject.digest?.sha256?.toLowerCase() === digest
    )
  );
}

function hasSingleSubject(statement: InTotoStatement, name: string, digest: string): boolean {
  return statement.subject?.length === 1 && subjectMatches(statement, name, digest);
}

function releaseAssetListMatches(statement: InTotoStatement, release: GitHubRelease): boolean {
  if (release.assets.some((asset) => !asset.digest?.startsWith('sha256:'))) return false;
  const expected = release.assets
    .filter((asset) => asset.digest?.startsWith('sha256:'))
    .map((asset) => `${asset.name}:${asset.digest!.slice('sha256:'.length).toLowerCase()}`)
    .sort();
  const actual = (statement.subject ?? [])
    .filter((subject) => subject.name && subject.digest?.sha256)
    .map((subject) => `${subject.name}:${subject.digest!.sha256.toLowerCase()}`)
    .sort();
  return expected.length > 0 && JSON.stringify(expected) === JSON.stringify(actual);
}

function hasSignedTimestamp(bundle: Bundle): boolean {
  const timestamps = bundle.verificationMaterial?.timestampVerificationData?.rfc3161Timestamps;
  return Array.isArray(timestamps) && timestamps.length >= 1;
}

function releaseIdentityMatches(
  statement: InTotoStatement,
  release: GitHubRelease,
  commit: string
): boolean {
  const predicate = statement.predicate as ReleasePredicate | undefined;
  const purl = `pkg:github/${TRUST_POLICY.repositoryFullName}@${release.tag_name}`;
  const commitAlgorithm = commit.length === 40 ? 'sha1' : 'sha256';
  return Boolean(
    predicate &&
    predicate.databaseId === String(release.id) &&
    predicate.packageId === String(TRUST_POLICY.repositoryId) &&
    predicate.purl === purl &&
    predicate.repository === TRUST_POLICY.repositoryFullName &&
    predicate.repositoryId === String(TRUST_POLICY.repositoryId) &&
    predicate.tag === release.tag_name &&
    statement.subject?.some(
      (subject) =>
        subject.uri === purl && subject.digest?.[commitAlgorithm]?.toLowerCase() === commit
    )
  );
}

function provenanceIdentityMatches(statement: InTotoStatement, commit: string): boolean {
  const predicate = statement.predicate as ProvenancePredicate | undefined;
  const definition = predicate?.buildDefinition;
  const workflow = definition?.externalParameters?.workflow;
  const repository = `https://github.com/${TRUST_POLICY.repositoryFullName}`;
  const ref = 'refs/heads/main';
  const source = `git+${repository}@${ref}`;
  return Boolean(
    definition?.buildType === 'https://actions.github.io/buildtypes/workflow/v1' &&
    workflow?.repository === repository &&
    workflow.ref === ref &&
    workflow.path === '.github/workflows/release-please.yml' &&
    definition.internalParameters?.github?.repository_id === String(TRUST_POLICY.repositoryId) &&
    definition.resolvedDependencies?.some(
      (dependency) =>
        dependency.uri === source && dependency.digest?.gitCommit?.toLowerCase() === commit
    )
  );
}

async function verifiedBundles(
  references: AttestationReference[],
  verifier: (bundle: Bundle) => Promise<void>,
  fetcher: typeof fetch
): Promise<Array<{ bundle: Bundle; statement: InTotoStatement }>> {
  const results: Array<{ bundle: Bundle; statement: InTotoStatement }> = [];
  for (const reference of references) {
    try {
      const bundle = (await fetchAttestationBundle(reference, fetcher)) as Bundle;
      await verifier(bundle);
      results.push({ bundle, statement: parseStatement(bundle) });
    } catch {
      // A digest can have unrelated or obsolete attestations. Only verified policy matches count.
    }
  }
  return results;
}

export async function verifyReleaseAttestations(options: {
  asset: GitHubAsset;
  assetDigest: string;
  commit: string;
  fetcher?: typeof fetch;
  githubTufRootPath: string;
  release: GitHubRelease;
  tufCachePath: string;
}): Promise<VerificationEvidence> {
  const fetcher = options.fetcher ?? fetch;
  const refAlgorithm = options.commit.length === 40 ? 'sha1' : 'sha256';
  const releaseReferences = (
    await listAttestations(`${refAlgorithm}:${options.commit}`, 'release', fetcher)
  ).filter((reference) => reference.initiator === 'github');

  const releaseMatches = await verifiedBundles(
    releaseReferences,
    async (bundle) => {
      await verify(bundle, {
        ctLogThreshold: 0,
        timeout: 15_000,
        tlogThreshold: 0,
        tufCachePath: path.join(options.tufCachePath, 'github'),
        tufMirrorURL: 'https://tuf-repo.github.com',
        tufRootPath: options.githubTufRootPath,
      });
    },
    fetcher
  );
  const matchingRelease = releaseMatches.filter(({ bundle, statement }) => {
    return (
      statement._type === STATEMENT_TYPE &&
      statement.predicateType === TRUST_POLICY.releasePredicate &&
      releaseIdentityMatches(statement, options.release, options.commit) &&
      subjectMatches(statement, options.asset.name, options.assetDigest) &&
      releaseAssetListMatches(statement, options.release) &&
      hasSignedTimestamp(bundle)
    );
  });
  if (matchingRelease.length !== 1) {
    throw new Error(
      `Release ${options.release.tag_name} must have exactly one valid GitHub release attestation.`
    );
  }

  const provenanceReferences = await listAttestations(
    `sha256:${options.assetDigest}`,
    'provenance',
    fetcher
  );
  const provenanceMatches: Array<{
    bundle: Bundle;
    signerIdentity: string;
    statement: InTotoStatement;
  }> = [];
  for (const signerIdentity of TRUST_POLICY.signerIdentities) {
    const matches = await verifiedBundles(
      provenanceReferences,
      async (bundle) => {
        await verify(bundle, {
          certificateIdentityURI: signerIdentity,
          certificateIssuer: TRUST_POLICY.oidcIssuer,
          ctLogThreshold: 1,
          timeout: 15_000,
          tlogThreshold: 1,
          tufCachePath: path.join(options.tufCachePath, 'public-good'),
        });
      },
      fetcher
    );
    provenanceMatches.push(...matches.map((match) => ({ ...match, signerIdentity })));
  }
  const matchingProvenance = provenanceMatches.filter(({ statement }) => {
    return (
      statement._type === STATEMENT_TYPE &&
      statement.predicateType === TRUST_POLICY.provenancePredicate &&
      hasSingleSubject(statement, options.asset.name, options.assetDigest) &&
      provenanceIdentityMatches(statement, options.commit)
    );
  });
  if (matchingProvenance.length !== 1) {
    throw new Error(
      `Release asset ${options.asset.name} must have exactly one valid StarryBio build attestation.`
    );
  }
  return {
    provenanceBundleDigest: sha256(JSON.stringify(matchingProvenance[0].bundle)),
    releaseBundleDigest: sha256(JSON.stringify(matchingRelease[0].bundle)),
    signerIdentity: matchingProvenance[0].signerIdentity,
  };
}
