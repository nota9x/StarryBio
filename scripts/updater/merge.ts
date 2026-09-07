import { chmod, lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { diff3Merge } from 'node-diff3';
import { migrateConfig } from './config-migration';
import { assertNoSymlinkAncestors, isDefaultAsset, isText, resolveInside } from './filesystem';
import type { ConflictRecord, ManifestFile, UpdateManifest, UpdateStats } from './types';

export type BufferMergeResult =
  { kind: 'clean'; contents: Buffer; merged: boolean } | { kind: 'conflict'; reason: string };

export function mergeBuffers(base: Buffer, local: Buffer, incoming: Buffer): BufferMergeResult {
  if (local.equals(incoming)) return { kind: 'clean', contents: local, merged: false };
  if (local.equals(base)) return { kind: 'clean', contents: incoming, merged: false };
  if (incoming.equals(base)) return { kind: 'clean', contents: local, merged: false };
  if (!isText(base) || !isText(local) || !isText(incoming)) {
    return { kind: 'conflict', reason: 'both the user and release changed a binary file' };
  }

  const eol = local.includes('\r\n') ? '\r\n' : '\n';
  const split = (contents: Buffer): string[] => contents.toString('utf8').split(/\r?\n/);
  const regions = diff3Merge(split(local), split(base), split(incoming), {
    excludeFalseConflicts: true,
  });
  if (regions.some((region) => region.conflict)) {
    return { kind: 'conflict', reason: 'local and release edits overlap' };
  }
  return {
    kind: 'clean',
    contents: Buffer.from(regions.flatMap((region) => region.ok ?? []).join(eol)),
    merged: true,
  };
}

async function readOptional(file: string): Promise<Buffer | undefined> {
  try {
    const info = await lstat(file);
    if (info.isSymbolicLink()) throw new Error(`Refusing to follow local symlink: ${file}`);
    if (!info.isFile()) return undefined;
    return await readFile(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function writeSafe(
  root: string,
  relative: string,
  contents: Buffer,
  mode = 0o644
): Promise<void> {
  await assertNoSymlinkAncestors(root, relative);
  const target = resolveInside(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents, { mode: 0o600 });
  if (process.platform !== 'win32') await chmod(target, mode);
}

async function removeSafe(root: string, relative: string): Promise<void> {
  await assertNoSymlinkAncestors(root, relative);
  await rm(resolveInside(root, relative), { force: true });
}

function fileMap(manifest: UpdateManifest): Map<string, ManifestFile> {
  return new Map(manifest.files.map((entry) => [entry.path, entry]));
}

export interface MergeReleaseOptions {
  baseDirectory: string;
  baseManifest: UpdateManifest;
  incomingDirectory: string;
  incomingManifest: UpdateManifest;
  stagingDirectory: string;
}

export interface MergeReleaseResult {
  conflicts: ConflictRecord[];
  stats: UpdateStats;
}

export async function mergeRelease(options: MergeReleaseOptions): Promise<MergeReleaseResult> {
  const baseFiles = fileMap(options.baseManifest);
  const incomingFiles = fileMap(options.incomingManifest);
  const conflicts: ConflictRecord[] = [];
  const stats: UpdateStats = {
    added: [],
    configAdded: [],
    configRemoved: [],
    configRewrittenAssets: [],
    merged: [],
    removed: [],
    renamed: [],
    updated: [],
  };
  const handledBase = new Set<string>();
  const handledIncoming = new Set<string>();
  const assetRewrites = new Map<string, string>();

  const conflict = (
    relative: string,
    reason: string,
    base?: Buffer,
    local?: Buffer,
    incoming?: Buffer
  ) => conflicts.push({ path: relative, reason, base, local, incoming });

  for (const name of [
    'dnd.svg',
    'favicon.svg',
    'idle.svg',
    'offline.svg',
    'online.svg',
    'profile.svg',
  ]) {
    const oldPath = `public/assets/images/${name}`;
    const newPath = `public/assets/images/default/${name}`;
    if (!baseFiles.has(oldPath) || !incomingFiles.has(newPath)) continue;
    handledBase.add(oldPath);
    const oldLocal = await readOptional(resolveInside(options.stagingDirectory, oldPath));
    const oldBase = await readFile(resolveInside(options.baseDirectory, oldPath));
    if (oldLocal?.equals(oldBase)) {
      assetRewrites.set(`assets/images/${name}`, `assets/images/default/${name}`);
      assetRewrites.set(`/assets/images/${name}`, `/assets/images/default/${name}`);
      await removeSafe(options.stagingDirectory, oldPath);
      stats.removed.push(oldPath);
    }
  }

  for (const rename of options.incomingManifest.renames) {
    const baseEntry = baseFiles.get(rename.from);
    const incomingEntry = incomingFiles.get(rename.to);
    if (
      !baseEntry ||
      !incomingEntry ||
      handledBase.has(rename.from) ||
      handledIncoming.has(rename.to)
    ) {
      conflict(rename.to, `ambiguous signed rename from ${rename.from}`);
      continue;
    }
    handledBase.add(rename.from);
    handledIncoming.add(rename.to);
    const base = await readFile(resolveInside(options.baseDirectory, rename.from));
    const local = await readOptional(resolveInside(options.stagingDirectory, rename.from));
    const destination = await readOptional(resolveInside(options.stagingDirectory, rename.to));
    const incoming = await readFile(resolveInside(options.incomingDirectory, rename.to));
    if (destination && rename.from !== rename.to) {
      conflict(
        rename.to,
        'rename destination collides with an existing file',
        base,
        destination,
        incoming
      );
      continue;
    }
    if (!local) {
      conflict(
        rename.to,
        'the user deleted a file that the release renamed',
        base,
        undefined,
        incoming
      );
      continue;
    }
    const merged = mergeBuffers(base, local, incoming);
    if (merged.kind === 'conflict') {
      conflict(rename.to, merged.reason, base, local, incoming);
      continue;
    }
    await writeSafe(options.stagingDirectory, rename.to, merged.contents, incomingEntry.mode);
    await removeSafe(options.stagingDirectory, rename.from);
    stats.renamed.push(rename);
    if (merged.merged) stats.merged.push(rename.to);
  }

  const paths = new Set([...baseFiles.keys(), ...incomingFiles.keys()]);
  for (const relative of [...paths].sort()) {
    if (relative === 'config/starrybio.config.ts') continue;
    if (handledBase.has(relative) || handledIncoming.has(relative)) continue;
    const baseEntry = baseFiles.get(relative);
    const incomingEntry = incomingFiles.get(relative);
    const local = await readOptional(resolveInside(options.stagingDirectory, relative));
    const base = baseEntry
      ? await readFile(resolveInside(options.baseDirectory, relative))
      : undefined;
    const incoming = incomingEntry
      ? await readFile(resolveInside(options.incomingDirectory, relative))
      : undefined;

    // Defaults are explicitly release-owned. A verified manifest may replace or remove them.
    if (isDefaultAsset(relative)) {
      if (incoming) {
        await writeSafe(options.stagingDirectory, relative, incoming, incomingEntry!.mode);
        (base ? stats.updated : stats.added).push(relative);
      } else if (local) {
        await removeSafe(options.stagingDirectory, relative);
        stats.removed.push(relative);
      }
      continue;
    }

    if (!base && incoming) {
      if (!local) {
        await writeSafe(options.stagingDirectory, relative, incoming, incomingEntry!.mode);
        stats.added.push(relative);
      } else if (!local.equals(incoming)) {
        conflict(
          relative,
          'release addition collides with a user-created file',
          undefined,
          local,
          incoming
        );
      }
      continue;
    }
    if (base && !incoming) {
      if (!local) continue;
      if (local.equals(base)) {
        await removeSafe(options.stagingDirectory, relative);
        stats.removed.push(relative);
      } else {
        conflict(relative, 'release deleted a file that the user modified', base, local);
      }
      continue;
    }
    if (!base || !incoming) continue;
    if (!local) {
      if (!incoming.equals(base)) {
        conflict(
          relative,
          'user deletion conflicts with a release modification',
          base,
          undefined,
          incoming
        );
      }
      continue;
    }
    const merged = mergeBuffers(base, local, incoming);
    if (merged.kind === 'conflict') {
      conflict(relative, merged.reason, base, local, incoming);
      continue;
    }
    if (!merged.contents.equals(local)) {
      await writeSafe(options.stagingDirectory, relative, merged.contents, incomingEntry!.mode);
      stats.updated.push(relative);
    }
    if (merged.merged) stats.merged.push(relative);
  }

  const configPath = 'config/starrybio.config.ts';
  const baseConfig = baseFiles.get(configPath);
  const incomingConfig = incomingFiles.get(configPath);
  if (baseConfig && incomingConfig) {
    const baseContents = await readFile(resolveInside(options.baseDirectory, configPath));
    const incomingContents = await readFile(resolveInside(options.incomingDirectory, configPath));
    const localContents = await readOptional(resolveInside(options.stagingDirectory, configPath));
    if (!localContents) {
      conflict(
        configPath,
        'the user deleted the configuration file',
        baseContents,
        undefined,
        incomingContents
      );
    } else {
      try {
        const migrated = migrateConfig(
          baseContents.toString('utf8'),
          localContents.toString('utf8'),
          incomingContents.toString('utf8'),
          assetRewrites
        );
        const migratedBuffer = Buffer.from(migrated.contents);
        if (!migratedBuffer.equals(localContents)) {
          await writeSafe(options.stagingDirectory, configPath, migratedBuffer);
          stats.updated.push(configPath);
        }
        stats.configAdded.push(...migrated.added);
        stats.configRemoved.push(...migrated.removed);
        stats.configRewrittenAssets.push(...migrated.rewrittenAssets);
      } catch (error) {
        conflict(
          configPath,
          error instanceof Error ? error.message : 'configuration migration failed',
          baseContents,
          localContents,
          incomingContents
        );
      }
    }
  }
  return { conflicts, stats };
}
