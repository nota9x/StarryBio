import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sha256 } from '../../scripts/updater/filesystem';
import {
  TRUST_POLICY,
  type GitHubRelease,
  type PreparedRelease,
  type UpdateManifest,
} from '../../scripts/updater/types';

import { runUpdater } from '../../scripts/updater/core';

const mocks = vi.hoisted(() => ({
  prepareRelease: vi.fn(),
}));

vi.mock('../../scripts/updater/release', () => ({ prepareRelease: mocks.prepareRelease }));

const temporaryDirectories: string[] = [];

afterEach(async () => {
  vi.clearAllMocks();
  await Promise.all(
    temporaryDirectories.splice(0).map((item) => rm(item, { force: true, recursive: true }))
  );
});

function githubRelease(version: string, id: number): GitHubRelease {
  return {
    assets: [],
    draft: false,
    id,
    immutable: true,
    prerelease: false,
    published_at: '2026-01-01T00:00:00Z',
    tag_name: `v${version}`,
  };
}

async function prepared(
  root: string,
  release: GitHubRelease,
  files: Record<string, string>
): Promise<PreparedRelease> {
  const version = release.tag_name.slice(1);
  const extracted = path.join(root, `extracted-${version}`);
  const payloadDirectory = path.join(extracted, 'payload');
  await mkdir(payloadDirectory, { recursive: true });
  for (const [file, contents] of Object.entries(files)) {
    const target = path.join(payloadDirectory, ...file.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  const manifest: UpdateManifest = {
    commit: `${release.id}`.padEnd(40, '0'),
    files: Object.entries(files).map(([file, contents]) => ({
      mode: 0o644,
      path: file,
      sha256: sha256(contents),
      size: Buffer.byteLength(contents),
    })),
    generatedAt: '2026-01-01T00:00:00Z',
    project: 'starrybio',
    renames: [],
    schemaVersion: 1,
    tag: release.tag_name,
    version,
  };
  await writeFile(path.join(extracted, 'manifest.json'), JSON.stringify(manifest));
  return {
    archivePath: path.join(root, `${version}.tgz`),
    asset: {
      browser_download_url: 'https://github.com/example',
      digest: `sha256:${sha256(version)}`,
      id: release.id,
      name: `starrybio-update-v${version}.tgz`,
      size: 1,
      state: 'uploaded',
    },
    commit: manifest.commit,
    manifest,
    payloadDirectory,
    release,
    verification: {
      provenanceBundleDigest: sha256(`provenance-${version}`),
      releaseBundleDigest: sha256(`release-${version}`),
      signerIdentity: TRUST_POLICY.signerIdentities[0],
    },
    version,
  };
}

describe('Git-free updater integration', () => {
  it('does not commit bootstrap state during a dry run', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'starrybio-core-dry-'));
    temporaryDirectories.push(root);
    const release = githubRelease('1.0.0', 1);
    await writeFile(path.join(root, 'package.json'), '{"version":"1.0.0"}\n');
    const current = await prepared(root, release, {
      'package.json': '{"version":"1.0.0"}\n',
    });
    mocks.prepareRelease.mockResolvedValue(current);

    const result = await runUpdater({
      dryRun: true,
      installRoot: root,
      releases: [release],
      skipValidationCommands: true,
    });

    expect(result.updated).toBe(false);
    await expect(readFile(path.join(root, '.starrybio/updater-state.json'))).rejects.toThrow();
  });

  it('composes multiple releases with no .git directory or Git on PATH', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'starrybio-core-'));
    temporaryDirectories.push(root);
    const releases = [
      githubRelease('1.0.0', 1),
      githubRelease('1.5.0', 15),
      githubRelease('2.0.0', 2),
    ];
    const fileSets: Record<string, Record<string, string>> = {
      '1.0.0': {
        'app.txt': 'a\nkeep-1\nb\nkeep-2\nc\n',
        'package.json': '{"version":"1.0.0"}\n',
      },
      '1.5.0': {
        'app.txt': 'a\nkeep-1\nb\nkeep-2\nC\n',
        'package.json': '{"version":"1.5.0"}\n',
      },
      '2.0.0': {
        'added.txt': 'new\n',
        'app.txt': 'a\nkeep-1\nB\nkeep-2\nC\n',
        'package.json': '{"version":"2.0.0"}\n',
      },
    };
    await writeFile(path.join(root, 'package.json'), '{"version":"1.0.0"}\n');
    await writeFile(path.join(root, 'app.txt'), 'A\nkeep-1\nb\nkeep-2\nc\n');
    await mkdir(path.join(root, 'public/assets/images'), { recursive: true });
    await writeFile(path.join(root, 'public/assets/images/mine.png'), 'user image');
    mocks.prepareRelease.mockImplementation(async ({ release }: { release: GitHubRelease }) =>
      prepared(root, release, fileSets[release.tag_name.slice(1)])
    );

    const priorPath = process.env.PATH;
    process.env.PATH = '';
    try {
      const result = await runUpdater({
        installRoot: root,
        releases,
        skipValidationCommands: true,
        yes: true,
      });
      expect(result.updated).toBe(true);
      expect(result.availableVersion).toBe('2.0.0');
    } finally {
      process.env.PATH = priorPath;
    }

    expect(await readFile(path.join(root, 'app.txt'), 'utf8')).toBe('A\nkeep-1\nB\nkeep-2\nC\n');
    expect(await readFile(path.join(root, 'added.txt'), 'utf8')).toBe('new\n');
    expect(await readFile(path.join(root, 'public/assets/images/mine.png'), 'utf8')).toBe(
      'user image'
    );
    expect(await readFile(path.join(root, 'package.json'), 'utf8')).toContain('2.0.0');
    expect(await readFile(path.join(root, '.starrybio/updater-state.json'), 'utf8')).toContain(
      '2.0.0'
    );
    await expect(readFile(path.join(root, '.git', 'HEAD'))).rejects.toThrow();
  });
});
