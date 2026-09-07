import { createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import semver from 'semver';
import snappy from 'snappyjs';
import { MAX_ARCHIVE_BYTES } from './filesystem';
import { TRUST_POLICY, type GitHubAsset, type GitHubRelease } from './types';

const API_ROOT = `https://api.github.com/repos/${TRUST_POLICY.repositoryFullName}`;
const API_VERSION = '2026-03-10';

function requestHeaders(): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'StarryBio-Updater',
    'X-GitHub-Api-Version': API_VERSION,
  };
}

export async function fetchJson<T>(url: string, fetcher: typeof fetch = fetch): Promise<T> {
  const response = await fetcher(url, { headers: requestHeaders(), redirect: 'follow' });
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}): ${url}`);
  return (await response.json()) as T;
}

export async function listReleases(fetcher: typeof fetch = fetch): Promise<GitHubRelease[]> {
  const releases: GitHubRelease[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await fetchJson<GitHubRelease[]>(
      `${API_ROOT}/releases?per_page=100&page=${page}`,
      fetcher
    );
    releases.push(...batch);
    if (batch.length < 100) break;
  }
  return releases;
}

export function releaseVersion(release: GitHubRelease): string | undefined {
  const value = release.tag_name.startsWith('v') ? release.tag_name.slice(1) : release.tag_name;
  return semver.valid(value) && !semver.prerelease(value) ? value : undefined;
}

export function stablePublishedReleases(releases: GitHubRelease[]): GitHubRelease[] {
  return releases
    .filter((release) => !release.draft && !release.prerelease && release.published_at)
    .filter((release) => releaseVersion(release))
    .sort((left, right) => semver.compare(releaseVersion(left)!, releaseVersion(right)!));
}

export function findReleaseAsset(release: GitHubRelease, version: string): GitHubAsset {
  const expected = `starrybio-update-v${version}.tgz`;
  const asset = release.assets.find((candidate) => candidate.name === expected);
  if (!asset || asset.state !== 'uploaded') {
    throw new Error(`Release ${release.tag_name} is missing the required ${expected} asset.`);
  }
  if (!asset.digest?.startsWith('sha256:')) {
    throw new Error(`Release asset ${expected} does not have a GitHub SHA-256 digest.`);
  }
  if (asset.size <= 0 || asset.size > MAX_ARCHIVE_BYTES) {
    throw new Error(`Release asset ${expected} has an invalid size.`);
  }
  return asset;
}

export async function resolveReleaseCommit(
  tagName: string,
  fetcher: typeof fetch = fetch
): Promise<string> {
  type Ref = { object: { sha: string; type: 'commit' | 'tag'; url: string } };
  type Tag = { object: { sha: string; type: 'commit' | 'tag'; url: string } };
  const encoded = tagName.split('/').map(encodeURIComponent).join('/');
  const ref = await fetchJson<Ref>(`${API_ROOT}/git/ref/tags/${encoded}`, fetcher);
  let object = ref.object;
  for (let depth = 0; object.type === 'tag' && depth < 4; depth += 1) {
    if (!object.url.startsWith(`${API_ROOT}/git/tags/`)) {
      throw new Error(`Release ${tagName} resolved to an unexpected GitHub object URL.`);
    }
    object = (await fetchJson<Tag>(object.url, fetcher)).object;
  }
  if (object.type !== 'commit' || !/^[a-f0-9]{40,64}$/i.test(object.sha)) {
    throw new Error(`Release ${tagName} does not resolve to a valid commit.`);
  }
  return object.sha.toLowerCase();
}

export function allowedDownloadUrl(url: string): boolean {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') return false;
  const host = parsed.hostname.toLowerCase();
  return (
    host === 'github.com' ||
    host === 'api.github.com' ||
    host.endsWith('.githubusercontent.com') ||
    host.endsWith('.blob.core.windows.net')
  );
}

export async function downloadFile(
  url: string,
  destination: string,
  expectedSize: number,
  fetcher: typeof fetch = fetch,
  maximumBytes = MAX_ARCHIVE_BYTES
): Promise<string> {
  if (!allowedDownloadUrl(url)) throw new Error(`Refusing untrusted download URL: ${url}`);
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.partial`;
  await rm(temporary, { force: true });
  const response = await fetcher(url, {
    headers: requestHeaders(),
    redirect: 'follow',
  });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }
  if (!allowedDownloadUrl(response.url)) {
    throw new Error(`Download redirected to an untrusted URL: ${response.url}`);
  }
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && (declared > maximumBytes || declared !== expectedSize)) {
    throw new Error(`Downloaded asset size does not match GitHub release metadata.`);
  }

  let bytes = 0;
  const hash = createHash('sha256');
  const meter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      bytes += chunk.length;
      if (bytes > maximumBytes) callback(new Error('Downloaded asset exceeds the size limit.'));
      else {
        hash.update(chunk);
        callback(null, chunk);
      }
    },
  });
  try {
    await pipeline(
      Readable.fromWeb(response.body as never),
      meter,
      createWriteStream(temporary, { mode: 0o600 })
    );
    if (bytes !== expectedSize) throw new Error('Downloaded asset is incomplete.');
    await rename(temporary, destination);
    return hash.digest('hex');
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

export interface AttestationReference {
  bundle_url: string;
  initiator: string;
  repository_id: number;
}

export async function listAttestations(
  digest: string,
  predicateType: 'provenance' | 'release',
  fetcher: typeof fetch = fetch
): Promise<AttestationReference[]> {
  const response = await fetchJson<{ attestations: AttestationReference[] }>(
    `${API_ROOT}/attestations/${encodeURIComponent(digest)}?predicate_type=${predicateType}&per_page=100`,
    fetcher
  );
  return response.attestations;
}

export async function fetchAttestationBundle(
  reference: AttestationReference,
  fetcher: typeof fetch = fetch
): Promise<unknown> {
  if (reference.repository_id !== TRUST_POLICY.repositoryId) {
    throw new Error('Attestation belongs to an unexpected repository ID.');
  }
  if (!allowedDownloadUrl(reference.bundle_url)) {
    throw new Error('Attestation bundle URL is not trusted.');
  }
  const response = await fetcher(reference.bundle_url, {
    headers: requestHeaders(),
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`Attestation download failed (${response.status}).`);
  if (response.url && !allowedDownloadUrl(response.url)) {
    throw new Error('Attestation download redirected to an untrusted host.');
  }
  const maximumCompressedBytes = 16 * 1024 * 1024;
  const declaredSize = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredSize) && declaredSize > maximumCompressedBytes) {
    throw new Error('Attestation bundle is too large.');
  }
  if (!response.body) throw new Error('Attestation download has no body.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let downloaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    downloaded += value.byteLength;
    if (downloaded > maximumCompressedBytes) {
      await reader.cancel();
      throw new Error('Attestation bundle is too large.');
    }
    chunks.push(value);
  }
  const compressed = Buffer.concat(chunks);
  const contentType = response.headers.get('content-type')?.toLowerCase();
  if (contentType === 'application/x-snappy') {
    let expectedSize = 0;
    let shift = 0;
    for (let index = 0; index < Math.min(compressed.byteLength, 5); index += 1) {
      const byte = compressed[index];
      expectedSize |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    if (expectedSize <= 0 || expectedSize > 32 * 1024 * 1024) {
      throw new Error('Expanded attestation bundle is too large.');
    }
  }
  const bytes = contentType === 'application/x-snappy' ? snappy.uncompress(compressed) : compressed;
  if (bytes.byteLength > 32 * 1024 * 1024)
    throw new Error('Expanded attestation bundle is too large.');
  try {
    return JSON.parse(Buffer.from(bytes).toString('utf8')) as unknown;
  } catch (error) {
    throw new Error('Attestation bundle is malformed.', { cause: error });
  }
}
