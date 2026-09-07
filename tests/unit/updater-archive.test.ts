import { gzipSync } from 'node:zlib';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as tar from 'tar';
import { afterEach, describe, expect, it } from 'vitest';
import { extractAndValidateArchive, validateManifest } from '../../scripts/updater/archive';
import { normalizeManifestPath, resolveInside, sha256 } from '../../scripts/updater/filesystem';

const temporaryDirectories: string[] = [];

async function temporaryDirectory() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'starrybio-archive-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((item) => rm(item, { force: true, recursive: true }))
  );
});

function maliciousTar(entryName: string, contents: Buffer): Buffer {
  const header = Buffer.alloc(512);
  header.write(entryName, 0, 100, 'utf8');
  header.write('0000644\0', 100, 'ascii');
  header.write('0000000\0', 108, 'ascii');
  header.write('0000000\0', 116, 'ascii');
  header.write(`${contents.length.toString(8).padStart(11, '0')}\0`, 124, 'ascii');
  header.write('00000000000\0', 136, 'ascii');
  header.fill(0x20, 148, 156);
  header.write('0', 156, 'ascii');
  header.write('ustar\0', 257, 'ascii');
  header.write('00', 263, 'ascii');
  const sum = header.reduce((total, byte) => total + byte, 0);
  header.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 'ascii');
  const padding = Buffer.alloc((512 - (contents.length % 512)) % 512);
  return gzipSync(Buffer.concat([header, contents, padding, Buffer.alloc(1024)]));
}

describe('archive and manifest containment', () => {
  it.each(['../escape', '/absolute', 'C:/windows', '\\\\server\\share', 'a\\b', 'a//b', 'a\0b'])(
    'rejects unsafe path %s',
    (unsafe) => expect(() => normalizeManifestPath(unsafe)).toThrow('Unsafe')
  );

  it('keeps resolved paths inside the installation', () => {
    expect(resolveInside('C:/site', 'config/site.ts')).toContain(
      path.join('site', 'config', 'site.ts')
    );
    expect(() => resolveInside('C:/site', '../outside')).toThrow();
  });

  it('rejects malformed, colliding, and user-image manifests', () => {
    const base = {
      commit: 'a'.repeat(40),
      files: [],
      generatedAt: '2026-01-01T00:00:00Z',
      project: 'starrybio',
      renames: [],
      schemaVersion: 1,
      tag: 'v1.0.0',
      version: '1.0.0',
    };
    expect(() =>
      validateManifest({
        ...base,
        files: [
          { mode: 0o644, path: 'public/assets/images/mine.png', sha256: 'a'.repeat(64), size: 1 },
        ],
      })
    ).toThrow('user-owned image');
    expect(() =>
      validateManifest({
        ...base,
        files: [
          { mode: 0o644, path: 'A.txt', sha256: 'a'.repeat(64), size: 1 },
          { mode: 0o644, path: 'a.txt', sha256: 'b'.repeat(64), size: 1 },
        ],
      })
    ).toThrow('colliding');
  });

  it('rejects corrupt downloads and path-traversal archive entries without writing outside staging', async () => {
    const root = await temporaryDirectory();
    const corrupt = path.join(root, 'corrupt.tgz');
    await writeFile(corrupt, 'not an archive');
    await expect(
      extractAndValidateArchive(corrupt, path.join(root, 'corrupt-out'))
    ).rejects.toThrow();

    const malicious = path.join(root, 'malicious.tgz');
    await writeFile(malicious, maliciousTar('../escaped.txt', Buffer.from('owned')));
    await expect(extractAndValidateArchive(malicious, path.join(root, 'out'))).rejects.toThrow();
    await expect(readFile(path.join(root, 'escaped.txt'))).rejects.toThrow();
  });

  it('round-trips a valid deterministic release payload and verifies every file digest', async () => {
    const root = await temporaryDirectory();
    const assembly = path.join(root, 'assembly');
    await mkdir(path.join(assembly, 'payload'), { recursive: true });
    const contents = Buffer.from('verified payload\n');
    await writeFile(path.join(assembly, 'payload', 'app.txt'), contents);
    await writeFile(
      path.join(assembly, 'manifest.json'),
      JSON.stringify({
        commit: 'a'.repeat(40),
        files: [
          {
            mode: 0o644,
            path: 'app.txt',
            sha256: sha256(contents),
            size: contents.length,
          },
        ],
        generatedAt: '2026-01-01T00:00:00Z',
        project: 'starrybio',
        renames: [],
        schemaVersion: 1,
        tag: 'v1.0.0',
        version: '1.0.0',
      })
    );
    const archive = path.join(root, 'release.tgz');
    await tar.create({ cwd: assembly, file: archive, gzip: true, portable: true }, [
      'manifest.json',
      'payload',
    ]);
    const extracted = await extractAndValidateArchive(archive, path.join(root, 'extracted'));
    expect(extracted.manifest.files).toHaveLength(1);
    expect(await readFile(path.join(extracted.payloadDirectory, 'app.txt'), 'utf8')).toBe(
      'verified payload\n'
    );
  });
});
