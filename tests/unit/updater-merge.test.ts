import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { sha256 } from '../../scripts/updater/filesystem';
import { mergeBuffers, mergeRelease } from '../../scripts/updater/merge';
import type { UpdateManifest } from '../../scripts/updater/types';

const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'starrybio-merge-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((item) => rm(item, { force: true, recursive: true }))
  );
});

function manifest(
  version: string,
  files: Record<string, string>,
  renames: UpdateManifest['renames'] = []
): UpdateManifest {
  return {
    commit: version.padEnd(40, '0').slice(0, 40),
    files: Object.entries(files).map(([file, contents]) => ({
      mode: 0o644,
      path: file,
      sha256: sha256(contents),
      size: Buffer.byteLength(contents),
    })),
    generatedAt: '2026-01-01T00:00:00Z',
    project: 'starrybio',
    renames,
    schemaVersion: 1,
    tag: `v${version}`,
    version,
  };
}

async function writeTree(root: string, files: Record<string, string>): Promise<void> {
  for (const [file, contents] of Object.entries(files)) {
    const target = path.join(root, ...file.split('/'));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
}

async function scenario(
  base: Record<string, string>,
  local: Record<string, string>,
  incoming: Record<string, string>,
  renames: UpdateManifest['renames'] = []
) {
  const root = await temporaryDirectory();
  const baseDirectory = path.join(root, 'base');
  const stagingDirectory = path.join(root, 'local');
  const incomingDirectory = path.join(root, 'incoming');
  await Promise.all([mkdir(baseDirectory), mkdir(stagingDirectory), mkdir(incomingDirectory)]);
  await writeTree(baseDirectory, base);
  await writeTree(stagingDirectory, local);
  await writeTree(incomingDirectory, incoming);
  const result = await mergeRelease({
    baseDirectory,
    baseManifest: manifest('1.0.0', base),
    incomingDirectory,
    incomingManifest: manifest('2.0.0', incoming, renames),
    stagingDirectory,
  });
  return { result, stagingDirectory };
}

describe('three-way release merging', () => {
  it('applies upstream-only changes and preserves local-only changes', async () => {
    const upstream = await scenario(
      { 'a.txt': 'base\n' },
      { 'a.txt': 'base\n' },
      { 'a.txt': 'new\n' }
    );
    expect(await readFile(path.join(upstream.stagingDirectory, 'a.txt'), 'utf8')).toBe('new\n');
    const local = await scenario(
      { 'a.txt': 'base\n' },
      { 'a.txt': 'mine\n' },
      { 'a.txt': 'base\n' }
    );
    expect(await readFile(path.join(local.stagingDirectory, 'a.txt'), 'utf8')).toBe('mine\n');
  });

  it('merges non-overlapping edits and reports overlapping edits', () => {
    const clean = mergeBuffers(
      Buffer.from('one\ntwo\nthree\n'),
      Buffer.from('ONE\ntwo\nthree\n'),
      Buffer.from('one\ntwo\nTHREE\n')
    );
    expect(clean.kind).toBe('clean');
    if (clean.kind === 'clean') expect(clean.contents.toString()).toBe('ONE\ntwo\nTHREE\n');
    expect(
      mergeBuffers(Buffer.from('base\n'), Buffer.from('mine\n'), Buffer.from('theirs\n')).kind
    ).toBe('conflict');
  });

  it('adds and deletes upstream files while preserving user-created files', async () => {
    const { result, stagingDirectory } = await scenario(
      { 'removed.txt': 'old' },
      { 'removed.txt': 'old', 'user.txt': 'mine' },
      { 'added.txt': 'new' }
    );
    expect(result.conflicts).toEqual([]);
    await expect(readFile(path.join(stagingDirectory, 'removed.txt'))).rejects.toThrow();
    expect(await readFile(path.join(stagingDirectory, 'added.txt'), 'utf8')).toBe('new');
    expect(await readFile(path.join(stagingDirectory, 'user.txt'), 'utf8')).toBe('mine');
  });

  it('conflicts on delete/modify, binary dual edits, and colliding additions', async () => {
    const deleted = await scenario({ 'a.txt': 'base' }, { 'a.txt': 'mine' }, {});
    expect(deleted.result.conflicts[0]?.reason).toContain('deleted');
    expect(mergeBuffers(Buffer.from([0, 1]), Buffer.from([0, 2]), Buffer.from([0, 3])).kind).toBe(
      'conflict'
    );
    const addition = await scenario({}, { 'a.txt': 'mine' }, { 'a.txt': 'incoming' });
    expect(addition.result.conflicts[0]?.reason).toContain('collides');
  });

  it('fully manages defaults but preserves custom images', async () => {
    const { stagingDirectory } = await scenario(
      { 'public/assets/images/default/profile.svg': 'old' },
      {
        'public/assets/images/default/profile.svg': 'customized default',
        'public/assets/images/custom.png': 'user',
      },
      { 'public/assets/images/default/profile.svg': 'new' }
    );
    expect(
      await readFile(
        path.join(stagingDirectory, 'public/assets/images/default/profile.svg'),
        'utf8'
      )
    ).toBe('new');
    expect(
      await readFile(path.join(stagingDirectory, 'public/assets/images/custom.png'), 'utf8')
    ).toBe('user');
  });

  it('applies signed rename metadata while retaining a safe local edit', async () => {
    const { result, stagingDirectory } = await scenario(
      { 'old.txt': 'one\nkeep\nthree\n' },
      { 'old.txt': 'ONE\nkeep\nthree\n' },
      { 'new.txt': 'one\nkeep\nTHREE\n' },
      [{ from: 'old.txt', to: 'new.txt' }]
    );
    expect(result.conflicts).toEqual([]);
    expect(await readFile(path.join(stagingDirectory, 'new.txt'), 'utf8')).toBe(
      'ONE\nkeep\nTHREE\n'
    );
    await expect(readFile(path.join(stagingDirectory, 'old.txt'))).rejects.toThrow();
  });

  it('migrates an unchanged legacy default asset and its known config reference', async () => {
    const oldConfig =
      "const config = { image: 'assets/images/profile.svg' };\nexport default config;\n";
    const newConfig =
      "const config = { image: 'assets/images/default/profile.svg' };\nexport default config;\n";
    const { result, stagingDirectory } = await scenario(
      {
        'config/starrybio.config.ts': oldConfig,
        'public/assets/images/profile.svg': '<svg>old</svg>',
      },
      {
        'config/starrybio.config.ts': oldConfig,
        'public/assets/images/profile.svg': '<svg>old</svg>',
        'public/assets/images/custom.png': 'user',
      },
      {
        'config/starrybio.config.ts': newConfig,
        'public/assets/images/default/profile.svg': '<svg>new</svg>',
      }
    );
    expect(result.conflicts).toEqual([]);
    expect(
      await readFile(path.join(stagingDirectory, 'config/starrybio.config.ts'), 'utf8')
    ).toContain('assets/images/default/profile.svg');
    await expect(
      readFile(path.join(stagingDirectory, 'public/assets/images/profile.svg'))
    ).rejects.toThrow();
    expect(
      await readFile(path.join(stagingDirectory, 'public/assets/images/custom.png'), 'utf8')
    ).toBe('user');
  });
});
