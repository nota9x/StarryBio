import { cp, lstat, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { extractAndValidateArchive } from './archive';
import { verifyReleaseAttestations } from './attestations';
import { downloadFile, findReleaseAsset, releaseVersion, resolveReleaseCommit } from './github';
import type { GitHubRelease, PreparedRelease } from './types';

async function assertSafeCacheTree(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const info = await lstat(absolute);
    if (info.isSymbolicLink() || (!info.isDirectory() && !info.isFile())) {
      throw new Error(`TUF cache contains an unsafe filesystem entry: ${absolute}`);
    }
    if (info.isDirectory()) await assertSafeCacheTree(absolute);
  }
}

export async function prepareRelease(options: {
  fetcher?: typeof fetch;
  githubTufRootPath: string;
  release: GitHubRelease;
  sharedTufCache: string;
  workDirectory: string;
}): Promise<PreparedRelease> {
  if (!options.release.immutable || options.release.draft || options.release.prerelease) {
    throw new Error(
      `Release ${options.release.tag_name} is not a published immutable stable release.`
    );
  }
  const version = releaseVersion(options.release);
  if (!version)
    throw new Error(`Release ${options.release.tag_name} is not a stable semantic version.`);
  const asset = findReleaseAsset(options.release, version);
  const expectedDigest = asset.digest!.slice('sha256:'.length).toLowerCase();
  const directory = path.join(options.workDirectory, `release-${options.release.id}`);
  const archivePath = path.join(directory, asset.name);
  const extractedDirectory = path.join(directory, 'extracted');
  const temporaryTufCache = path.join(directory, 'tuf');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  try {
    if ((await lstat(options.sharedTufCache)).isDirectory()) {
      await assertSafeCacheTree(options.sharedTufCache);
      await cp(options.sharedTufCache, temporaryTufCache, { recursive: true, force: true });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
  const commit = await resolveReleaseCommit(options.release.tag_name, options.fetcher);
  const actualDigest = await downloadFile(
    asset.browser_download_url,
    archivePath,
    asset.size,
    options.fetcher
  );
  if (actualDigest !== expectedDigest) {
    throw new Error(`Release asset ${asset.name} does not match its GitHub digest.`);
  }
  const verification = await verifyReleaseAttestations({
    asset,
    assetDigest: actualDigest,
    commit,
    fetcher: options.fetcher,
    githubTufRootPath: options.githubTufRootPath,
    release: options.release,
    tufCachePath: temporaryTufCache,
  });
  const extracted = await extractAndValidateArchive(archivePath, extractedDirectory);
  if (
    extracted.manifest.version !== version ||
    extracted.manifest.tag !== options.release.tag_name ||
    extracted.manifest.commit.toLowerCase() !== commit
  ) {
    throw new Error(`Release manifest identity does not match ${options.release.tag_name}.`);
  }
  // Root metadata is shared only after every signature, identity, archive and manifest check succeeds.
  await mkdir(options.sharedTufCache, { recursive: true, mode: 0o700 });
  await cp(temporaryTufCache, options.sharedTufCache, {
    recursive: true,
    force: true,
    preserveTimestamps: true,
  });
  return {
    archivePath,
    asset,
    commit,
    manifest: extracted.manifest,
    payloadDirectory: extracted.payloadDirectory,
    release: options.release,
    verification,
    version,
  };
}
