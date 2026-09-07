import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import semver from 'semver';
import { TRUST_POLICY, UPDATE_STATE_SCHEMA, type UpdaterState } from './types';

export interface UpdaterPaths {
  baseline: string;
  conflicts: string;
  journal: string;
  legacy: string;
  lock: string;
  metadata: string;
  root: string;
  state: string;
  tuf: string;
  work: string;
}

export function updaterPaths(installationRoot: string): UpdaterPaths {
  const root = path.join(installationRoot, '.starrybio');
  return {
    baseline: path.join(root, 'baseline'),
    conflicts: path.join(root, 'conflicts'),
    journal: path.join(root, 'transaction.json'),
    legacy: path.join(root, 'legacy'),
    lock: path.join(root, 'update.lock'),
    metadata: root,
    root: installationRoot,
    state: path.join(root, 'updater-state.json'),
    tuf: path.join(root, 'tuf'),
    work: path.join(root, 'work'),
  };
}

export async function readUpdaterState(file: string): Promise<UpdaterState | undefined> {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8')) as UpdaterState;
    if (
      parsed.schemaVersion !== UPDATE_STATE_SCHEMA ||
      !semver.valid(parsed.installedVersion) ||
      parsed.tag !== `v${parsed.installedVersion}` ||
      !/^[a-f0-9]{40,64}$/i.test(parsed.commit) ||
      !/^[a-f0-9]{64}$/i.test(parsed.assetDigest) ||
      !/^[a-f0-9]{64}$/i.test(parsed.provenanceBundleDigest) ||
      !/^[a-f0-9]{64}$/i.test(parsed.releaseBundleDigest) ||
      parsed.assetName !== `starrybio-update-v${parsed.installedVersion}.tgz` ||
      !Number.isSafeInteger(parsed.releaseId) ||
      parsed.repositoryId !== TRUST_POLICY.repositoryId ||
      !TRUST_POLICY.signerIdentities.some((identity) => identity === parsed.signerIdentity) ||
      !Number.isFinite(Date.parse(parsed.verifiedAt))
    ) {
      throw new Error('Updater state uses an unsupported schema.');
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

export async function writeJsonAtomic(file: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.new`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, file);
}

function pidIsAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function acquireUpdateLock(paths: UpdaterPaths): Promise<() => Promise<void>> {
  await mkdir(paths.metadata, { recursive: true, mode: 0o700 });
  try {
    const existing = JSON.parse(await readFile(paths.lock, 'utf8')) as { pid?: number };
    if (existing.pid && pidIsAlive(existing.pid)) {
      throw new Error('Another StarryBio update is already running.');
    }
    await rm(paths.lock, { force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      if (error instanceof SyntaxError) await rm(paths.lock, { force: true });
      else throw error;
    }
  }
  const handle = await open(paths.lock, 'wx', 0o600);
  await handle.writeFile(
    `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`
  );
  await handle.close();
  return async () => rm(paths.lock, { force: true });
}
