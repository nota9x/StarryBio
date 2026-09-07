import { chmod, lstat, mkdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import semver from 'semver';
import * as tar from 'tar';
import {
  MAX_ARCHIVE_ENTRIES,
  MAX_EXTRACTED_BYTES,
  MAX_FILE_BYTES,
  isForbiddenManagedImage,
  normalizeManifestPath,
  resolveInside,
  sha256,
} from './filesystem';
import { PROJECT_ID, UPDATE_MANIFEST_SCHEMA, type UpdateManifest } from './types';

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const LEGACY_DEFAULT_ASSETS = new Set(
  ['dnd.svg', 'favicon.svg', 'idle.svg', 'offline.svg', 'online.svg', 'profile.svg'].map(
    (name) => `public/assets/images/${name}`
  )
);

export function validateManifest(value: unknown): UpdateManifest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Release manifest must be an object.');
  }
  const manifest = value as Partial<UpdateManifest>;
  if (
    manifest.schemaVersion !== UPDATE_MANIFEST_SCHEMA ||
    manifest.project !== PROJECT_ID ||
    typeof manifest.version !== 'string' ||
    typeof manifest.tag !== 'string' ||
    typeof manifest.commit !== 'string' ||
    !/^[a-f0-9]{40,64}$/i.test(manifest.commit) ||
    typeof manifest.generatedAt !== 'string' ||
    !Number.isFinite(Date.parse(manifest.generatedAt)) ||
    !Array.isArray(manifest.files) ||
    !Array.isArray(manifest.renames)
  ) {
    throw new Error('Release manifest has an unsupported or incomplete schema.');
  }
  if (
    !semver.valid(manifest.version) ||
    semver.prerelease(manifest.version) ||
    manifest.tag !== `v${manifest.version}`
  ) {
    throw new Error('Release manifest version and tag are inconsistent.');
  }
  const names = new Set<string>();
  const foldedNames = new Set<string>();
  let totalSize = 0;
  for (const entry of manifest.files) {
    if (
      !entry ||
      typeof entry.path !== 'string' ||
      !Number.isSafeInteger(entry.size) ||
      entry.size < 0 ||
      entry.size > MAX_FILE_BYTES ||
      !Number.isSafeInteger(entry.mode) ||
      ![0o644, 0o755].includes(entry.mode) ||
      !SHA256_PATTERN.test(entry.sha256)
    ) {
      throw new Error('Release manifest contains an invalid file entry.');
    }
    entry.path = normalizeManifestPath(entry.path);
    if (
      entry.path === '.git' ||
      entry.path.startsWith('.git/') ||
      entry.path === '.starrybio' ||
      entry.path.startsWith('.starrybio/') ||
      entry.path === 'node_modules' ||
      entry.path.startsWith('node_modules/') ||
      entry.path === 'dist' ||
      entry.path.startsWith('dist/') ||
      entry.path === 'release-artifacts' ||
      entry.path.startsWith('release-artifacts/')
    ) {
      throw new Error(`Release manifest targets a reserved updater path: ${entry.path}`);
    }
    const historicalDefault =
      semver.lt(manifest.version, '3.6.0') && LEGACY_DEFAULT_ASSETS.has(entry.path);
    if (isForbiddenManagedImage(entry.path) && !historicalDefault) {
      throw new Error(`Release attempts to manage a user-owned image: ${entry.path}`);
    }
    const folded = entry.path.toLocaleLowerCase('en-US');
    if (names.has(entry.path) || foldedNames.has(folded)) {
      throw new Error(`Release manifest contains a colliding path: ${entry.path}`);
    }
    names.add(entry.path);
    foldedNames.add(folded);
    totalSize += entry.size;
  }
  if (manifest.files.length > MAX_ARCHIVE_ENTRIES || totalSize > MAX_EXTRACTED_BYTES) {
    throw new Error('Release manifest exceeds updater safety limits.');
  }
  const renameSources = new Set<string>();
  const renameDestinations = new Set<string>();
  for (const rename of manifest.renames) {
    if (!rename || typeof rename.from !== 'string' || typeof rename.to !== 'string') {
      throw new Error('Release manifest contains an invalid rename.');
    }
    rename.from = normalizeManifestPath(rename.from);
    rename.to = normalizeManifestPath(rename.to);
    if (!names.has(rename.to) || rename.from === rename.to) {
      throw new Error(`Release manifest contains an invalid rename to ${rename.to}.`);
    }
    if (renameSources.has(rename.from) || renameDestinations.has(rename.to)) {
      throw new Error('Release manifest contains an ambiguous rename.');
    }
    renameSources.add(rename.from);
    renameDestinations.add(rename.to);
  }
  return manifest as UpdateManifest;
}

function safeArchivePath(value: string): string {
  const normalized = value.endsWith('/') ? value.slice(0, -1) : value;
  if (normalized === 'manifest.json' || normalized === 'payload') return normalized;
  if (!normalized.startsWith('payload/')) throw new Error(`Unexpected archive entry: ${value}`);
  normalizeManifestPath(normalized.slice('payload/'.length));
  return normalized;
}

export async function extractAndValidateArchive(
  archive: string,
  outputDirectory: string
): Promise<{ manifest: UpdateManifest; payloadDirectory: string }> {
  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  const archivePaths = new Set<string>();
  const archiveFiles = new Set<string>();
  const foldedPaths = new Set<string>();
  let entries = 0;
  let expandedBytes = 0;
  let scanError: Error | undefined;
  await tar.list({
    file: archive,
    onReadEntry(entry) {
      if (scanError) return;
      try {
        entries += 1;
        if (entries > MAX_ARCHIVE_ENTRIES) throw new Error('Archive contains too many entries.');
        const safePath = safeArchivePath(entry.path);
        const folded = safePath.normalize('NFC').toLocaleLowerCase('en-US');
        if (archivePaths.has(safePath) || foldedPaths.has(folded)) {
          throw new Error(`Archive contains a duplicate or colliding path: ${entry.path}`);
        }
        archivePaths.add(safePath);
        foldedPaths.add(folded);
        if (!['File', 'Directory'].includes(entry.type)) {
          throw new Error(`Archive contains unsupported entry type ${entry.type}: ${entry.path}`);
        }
        if (entry.size > MAX_FILE_BYTES)
          throw new Error(`Archive entry is too large: ${entry.path}`);
        if (entry.type === 'File') archiveFiles.add(safePath);
        expandedBytes += entry.size;
        if (expandedBytes > MAX_EXTRACTED_BYTES)
          throw new Error('Archive expands beyond safety limits.');
      } catch (error) {
        scanError = error instanceof Error ? error : new Error(String(error));
      }
    },
    strict: true,
  });
  if (scanError) throw scanError;
  if (!archivePaths.has('manifest.json') || !archivePaths.has('payload')) {
    throw new Error('Archive is missing its manifest or payload root.');
  }

  try {
    await tar.extract({
      cwd: outputDirectory,
      file: archive,
      filter(entryPath, entry) {
        safeArchivePath(entryPath);
        return 'type' in entry && ['File', 'Directory'].includes(entry.type);
      },
      preserveOwner: false,
      strict: true,
    });
    const manifest = validateManifest(
      JSON.parse(await readFile(path.join(outputDirectory, 'manifest.json'), 'utf8'))
    );
    const payloadDirectory = path.join(outputDirectory, 'payload');
    for (const file of manifest.files) {
      const absolute = resolveInside(payloadDirectory, file.path);
      const info = await lstat(absolute);
      if (!info.isFile() || info.isSymbolicLink() || info.size !== file.size) {
        throw new Error(`Release payload does not match its manifest: ${file.path}`);
      }
      const contents = await readFile(absolute);
      if (sha256(contents) !== file.sha256) {
        throw new Error(`Release payload checksum failed: ${file.path}`);
      }
      if (process.platform !== 'win32') await chmod(absolute, file.mode & 0o777);
    }
    const payloadEntries = [...archiveFiles]
      .filter((entry) => entry.startsWith('payload/') && entry !== 'payload')
      .map((entry) => entry.slice('payload/'.length));
    const declared = new Set(manifest.files.map((file) => file.path));
    const unexpected = payloadEntries.find((entry) => !declared.has(entry));
    if (unexpected) throw new Error(`Archive contains an undeclared payload file: ${unexpected}`);
    return { manifest, payloadDirectory };
  } catch (error) {
    await rm(outputDirectory, { force: true, recursive: true });
    throw error;
  }
}

export async function validatePayloadDirectory(
  manifest: UpdateManifest,
  payloadDirectory: string
): Promise<void> {
  for (const file of manifest.files) {
    const absolute = resolveInside(payloadDirectory, file.path);
    const info = await lstat(absolute);
    if (!info.isFile() || info.isSymbolicLink() || info.size !== file.size) {
      throw new Error(`Cached release baseline does not match its manifest: ${file.path}`);
    }
    if (sha256(await readFile(absolute)) !== file.sha256) {
      throw new Error(`Cached release baseline checksum failed: ${file.path}`);
    }
  }
}
