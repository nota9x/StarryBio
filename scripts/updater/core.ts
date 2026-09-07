import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import semver from 'semver';
import { validateManifest, validatePayloadDirectory } from './archive';
import { canonicalRoot, ensurePrivateDirectory, resolveInside, sha256File } from './filesystem';
import { listReleases, releaseVersion, stablePublishedReleases } from './github';
import { mergeRelease } from './merge';
import { prepareRelease } from './release';
import {
  acquireUpdateLock,
  readUpdaterState,
  updaterPaths,
  writeJsonAtomic,
  type UpdaterPaths,
} from './state';
import { commitStaging, finishTransaction, recoverInterruptedTransaction } from './transaction';
import {
  TRUST_POLICY,
  UPDATE_STATE_SCHEMA,
  type ConflictRecord,
  type GitHubRelease,
  type PreparedRelease,
  type UpdateManifest,
  type UpdateStats,
  type UpdaterState,
} from './types';

export interface UpdateOptions {
  check?: boolean;
  dryRun?: boolean;
  fetcher?: typeof fetch;
  installRoot?: string;
  releases?: GitHubRelease[];
  skipValidationCommands?: boolean;
  yes?: boolean;
}

export interface UpdateResult {
  availableVersion?: string;
  conflicts: string[];
  currentVersion: string;
  provenanceVerified: boolean;
  rollbackCompleted: boolean;
  stats: UpdateStats;
  updated: boolean;
}

const EMPTY_STATS: UpdateStats = {
  added: [],
  configAdded: [],
  configRemoved: [],
  configRewrittenAssets: [],
  merged: [],
  removed: [],
  renamed: [],
  updated: [],
};

function mergeStats(target: UpdateStats, source: UpdateStats): void {
  target.added.push(...source.added);
  target.configAdded.push(...source.configAdded);
  target.configRemoved.push(...source.configRemoved);
  target.configRewrittenAssets.push(...source.configRewrittenAssets);
  target.merged.push(...source.merged);
  target.removed.push(...source.removed);
  target.renamed.push(...source.renamed);
  target.updated.push(...source.updated);
}

async function packageVersion(root: string): Promise<string> {
  const value = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as {
    version?: string;
  };
  if (!value.version || !semver.valid(value.version))
    throw new Error('package.json has no valid version.');
  return value.version;
}

async function fingerprintPaths(
  root: string,
  paths: Iterable<string>
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  for (const relative of paths) {
    const absolute = resolveInside(root, relative);
    try {
      const info = await lstat(absolute);
      if (info.isSymbolicLink())
        throw new Error(`Refusing local symlink at managed path: ${relative}`);
      result.set(
        relative,
        info.isFile()
          ? `file:${info.mode}:${info.size}:${await sha256File(absolute)}`
          : `type:${info.mode}`
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') result.set(relative, 'absent');
      else throw error;
    }
  }
  return result;
}

async function assertFingerprintsUnchanged(
  root: string,
  expected: ReadonlyMap<string, string>
): Promise<void> {
  const actual = await fingerprintPaths(root, expected.keys());
  for (const [relative, fingerprint] of expected) {
    if (actual.get(relative) !== fingerprint) {
      throw new Error(`Local file changed while the update was being prepared: ${relative}`);
    }
  }
}

async function cloneInstallation(root: string, candidate: string): Promise<void> {
  await rm(candidate, { force: true, recursive: true });
  await mkdir(candidate, { recursive: true, mode: 0o700 });
  const copyEntry = async (source: string, destination: string): Promise<void> => {
    const info = await lstat(source);
    if (info.isSymbolicLink()) throw new Error(`Refusing to stage local symlink: ${source}`);
    if (info.isDirectory()) {
      await mkdir(destination, { recursive: true, mode: info.mode & 0o777 });
      for (const entry of await readdir(source)) {
        await copyEntry(path.join(source, entry), path.join(destination, entry));
      }
    } else if (info.isFile()) {
      await cp(source, destination, { preserveTimestamps: true });
    } else {
      throw new Error(`Refusing to stage local special file: ${source}`);
    }
  };
  for (const entry of await readdir(root)) {
    if (['.starrybio', 'node_modules', 'dist'].includes(entry)) continue;
    await copyEntry(path.join(root, entry), path.join(candidate, entry));
  }
}

async function runCommand(command: string, arguments_: string[], cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const executable = process.platform === 'win32' ? `${command}.cmd` : command;
    const child = spawn(executable, arguments_, { cwd, stdio: 'inherit', shell: false });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${arguments_.join(' ')} failed (${signal ?? code}).`));
    });
  });
}

async function saveConflicts(
  paths: UpdaterPaths,
  transactionId: string,
  conflicts: ConflictRecord[]
) {
  const root = path.join(paths.conflicts, transactionId);
  await rm(root, { force: true, recursive: true });
  for (const item of conflicts) {
    for (const [name, contents] of [
      ['base', item.base],
      ['local', item.local],
      ['incoming', item.incoming],
    ] as const) {
      if (!contents) continue;
      const target = resolveInside(path.join(root, name), item.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, contents, { mode: 0o600 });
    }
  }
  await mkdir(root, { recursive: true, mode: 0o700 });
  await writeFile(
    path.join(root, 'report.json'),
    `${JSON.stringify({ conflicts: conflicts.map(({ path: file, reason }) => ({ path: file, reason })) }, null, 2)}\n`,
    { mode: 0o600 }
  );
  return root;
}

async function loadBaseline(paths: UpdaterPaths): Promise<{
  manifest: UpdateManifest;
  payloadDirectory: string;
}> {
  const manifest = validateManifest(
    JSON.parse(await readFile(path.join(paths.baseline, 'manifest.json'), 'utf8'))
  );
  const payloadDirectory = path.join(paths.baseline, 'payload');
  await validatePayloadDirectory(manifest, payloadDirectory);
  return { manifest, payloadDirectory };
}

function stateFor(release: PreparedRelease): UpdaterState {
  return {
    assetDigest: release.asset.digest!.slice('sha256:'.length),
    assetName: release.asset.name,
    commit: release.commit,
    installedVersion: release.version,
    provenanceBundleDigest: release.verification.provenanceBundleDigest,
    releaseBundleDigest: release.verification.releaseBundleDigest,
    releaseId: release.release.id,
    repositoryId: TRUST_POLICY.repositoryId,
    schemaVersion: UPDATE_STATE_SCHEMA,
    signerIdentity: release.verification.signerIdentity,
    tag: release.release.tag_name,
    verifiedAt: new Date().toISOString(),
  };
}

async function confirmUpdate(current: string, next: string): Promise<boolean> {
  if (!process.stdin.isTTY) {
    throw new Error('Confirmation requires an interactive terminal; use --yes for automation.');
  }
  const input = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await input.question(`Install StarryBio ${next} over ${current}? [y/N] `);
    return /^y(?:es)?$/i.test(answer.trim());
  } finally {
    input.close();
  }
}

async function migrateLegacyState(root: string, candidate: string): Promise<boolean> {
  const legacy = path.join(root, '.starrybio-updater.json');
  try {
    const info = await lstat(legacy);
    if (!info.isFile() || info.isSymbolicLink())
      throw new Error('Legacy updater state is not a regular file.');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
  const destination = path.join(candidate, '.starrybio', 'legacy', '.starrybio-updater.json');
  await mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
  await cp(legacy, destination, { preserveTimestamps: true });
  await rm(path.join(candidate, '.starrybio-updater.json'), { force: true });
  return true;
}

export async function runUpdater(options: UpdateOptions = {}): Promise<UpdateResult> {
  const root = await canonicalRoot(options.installRoot ?? process.cwd());
  const paths = updaterPaths(root);
  await ensurePrivateDirectory(paths.metadata);
  const releaseLock = await acquireUpdateLock(paths);
  let rollbackCompleted: boolean;
  let activeTransactionRoot: string | undefined;
  try {
    rollbackCompleted = await recoverInterruptedTransaction(paths);
    const state = await readUpdaterState(paths.state);
    const localPackageVersion = await packageVersion(root);
    if (state && state.installedVersion !== localPackageVersion) {
      throw new Error(
        `Updater state says ${state.installedVersion}, but package.json says ${localPackageVersion}.`
      );
    }
    const currentVersion = state?.installedVersion ?? localPackageVersion;
    const releases = stablePublishedReleases(
      options.releases ?? (await listReleases(options.fetcher))
    );
    const currentRelease = releases.find((release) => releaseVersion(release) === currentVersion);
    if (!currentRelease) {
      throw new Error(
        `Installed version ${currentVersion} has no published stable GitHub Release.`
      );
    }
    const transactionId = randomUUID();
    const transactionRoot = path.join(paths.work, transactionId);
    activeTransactionRoot = transactionRoot;
    await ensurePrivateDirectory(transactionRoot);
    const githubTufRootPath = path.join(import.meta.dirname, 'github-tuf-root.json');
    const currentPrepared = state
      ? undefined
      : await prepareRelease({
          fetcher: options.fetcher,
          githubTufRootPath,
          release: currentRelease,
          sharedTufCache: paths.tuf,
          workDirectory: transactionRoot,
        });
    let base = state ? await loadBaseline(paths) : currentPrepared!;
    if (
      state &&
      (base.manifest.version !== state.installedVersion ||
        base.manifest.tag !== state.tag ||
        base.manifest.commit.toLowerCase() !== state.commit.toLowerCase())
    ) {
      throw new Error('Cached verified baseline identity does not match updater state.');
    }
    const startingBaseManifest = base.manifest;
    const eligible = releases.filter((release) =>
      semver.gt(releaseVersion(release)!, currentVersion)
    );
    if (eligible.length === 0) {
      if (currentPrepared && !options.check && !options.dryRun) {
        const metadataStage = path.join(transactionRoot, 'metadata-stage');
        await mkdir(path.join(metadataStage, '.starrybio'), { recursive: true, mode: 0o700 });
        await cp(
          path.dirname(currentPrepared.payloadDirectory),
          path.join(metadataStage, '.starrybio', 'baseline'),
          {
            recursive: true,
            force: true,
            preserveTimestamps: true,
          }
        );
        await writeJsonAtomic(
          path.join(metadataStage, '.starrybio', 'updater-state.json'),
          stateFor(currentPrepared)
        );
        await commitStaging({
          affectedPaths: ['.starrybio/baseline', '.starrybio/updater-state.json'],
          paths,
          stagingRoot: metadataStage,
          transactionId,
        });
        await finishTransaction(paths, transactionId);
      }
      await rm(transactionRoot, { force: true, recursive: true });
      return {
        conflicts: [],
        currentVersion,
        provenanceVerified: true,
        rollbackCompleted,
        stats: structuredClone(EMPTY_STATS),
        updated: false,
      };
    }
    const prepared: PreparedRelease[] = [];
    for (const release of eligible) {
      prepared.push(
        await prepareRelease({
          fetcher: options.fetcher,
          githubTufRootPath,
          release,
          sharedTufCache: paths.tuf,
          workDirectory: transactionRoot,
        })
      );
    }
    const latest = prepared.at(-1)!;
    if (options.check) {
      await rm(transactionRoot, { force: true, recursive: true });
      return {
        availableVersion: latest.version,
        conflicts: [],
        currentVersion,
        provenanceVerified: true,
        rollbackCompleted,
        stats: structuredClone(EMPTY_STATS),
        updated: false,
      };
    }

    const protectedPaths = new Set(startingBaseManifest.files.map((file) => file.path));
    for (const release of prepared) {
      for (const file of release.manifest.files) protectedPaths.add(file.path);
    }
    const localFingerprints = await fingerprintPaths(root, protectedPaths);
    const candidate = path.join(transactionRoot, 'candidate');
    await cloneInstallation(root, candidate);
    const stats = structuredClone(EMPTY_STATS);
    for (const incoming of prepared) {
      const result = await mergeRelease({
        baseDirectory: base.payloadDirectory,
        baseManifest: base.manifest,
        incomingDirectory: incoming.payloadDirectory,
        incomingManifest: incoming.manifest,
        stagingDirectory: candidate,
      });
      mergeStats(stats, result.stats);
      if (result.conflicts.length > 0) {
        const report = await saveConflicts(paths, transactionId, result.conflicts);
        throw new Error(`Update has ${result.conflicts.length} conflict(s). Details: ${report}`);
      }
      base = incoming;
    }

    if (!options.skipValidationCommands) {
      await runCommand('pnpm', ['install', '--frozen-lockfile'], candidate);
      await runCommand('pnpm', ['run', 'build'], candidate);
    }
    if (options.dryRun) {
      await rm(transactionRoot, { force: true, recursive: true });
      return {
        availableVersion: latest.version,
        conflicts: [],
        currentVersion,
        provenanceVerified: true,
        rollbackCompleted,
        stats,
        updated: false,
      };
    }
    if (!options.yes) {
      console.log(`Current version: ${currentVersion}`);
      console.log(`Available release: ${latest.version}`);
      console.log(
        `Staged plan: ${stats.added.length} added, ${stats.updated.length} updated, ` +
          `${stats.removed.length} removed, ${stats.merged.length} automatically merged.`
      );
    }
    if (!options.yes && !(await confirmUpdate(currentVersion, latest.version))) {
      await rm(transactionRoot, { force: true, recursive: true });
      return {
        availableVersion: latest.version,
        conflicts: [],
        currentVersion,
        provenanceVerified: true,
        rollbackCompleted,
        stats,
        updated: false,
      };
    }

    await assertFingerprintsUnchanged(root, localFingerprints);

    const legacyMigrated = await migrateLegacyState(root, candidate);
    const candidateMetadata = path.join(candidate, '.starrybio');
    await mkdir(candidateMetadata, { recursive: true, mode: 0o700 });
    await cp(path.dirname(latest.payloadDirectory), path.join(candidateMetadata, 'baseline'), {
      recursive: true,
      force: true,
      preserveTimestamps: true,
    });
    await writeJsonAtomic(path.join(candidateMetadata, 'updater-state.json'), stateFor(latest));

    const managed = new Set<string>();
    for (const file of startingBaseManifest.files) managed.add(file.path);
    for (const release of prepared)
      for (const file of release.manifest.files) managed.add(file.path);
    managed.add('node_modules');
    managed.add('dist');
    managed.add('.starrybio/baseline');
    managed.add('.starrybio/updater-state.json');
    if (legacyMigrated) {
      managed.add('.starrybio-updater.json');
      managed.add('.starrybio/legacy/.starrybio-updater.json');
    }
    await commitStaging({
      affectedPaths: [...managed],
      paths,
      stagingRoot: candidate,
      transactionId,
    });
    await finishTransaction(paths, transactionId);
    await rm(transactionRoot, { force: true, recursive: true });
    return {
      availableVersion: latest.version,
      conflicts: [],
      currentVersion,
      provenanceVerified: true,
      rollbackCompleted,
      stats,
      updated: true,
    };
  } finally {
    if (activeTransactionRoot) {
      try {
        await lstat(paths.journal);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          await rm(activeTransactionRoot, { force: true, recursive: true });
        }
      }
    }
    await releaseLock();
  }
}
