import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

export const MAX_ARCHIVE_BYTES = 256 * 1024 * 1024;
export const MAX_EXTRACTED_BYTES = 1024 * 1024 * 1024;
export const MAX_FILE_BYTES = 128 * 1024 * 1024;
export const MAX_ARCHIVE_ENTRIES = 25_000;

export function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

export async function sha256File(file: string): Promise<string> {
  const data = await readFile(file);
  return sha256(data);
}

export function normalizeManifestPath(value: string): string {
  if (!value || value.includes('\0') || value.includes('\\')) {
    throw new Error(`Unsafe manifest path: ${JSON.stringify(value)}`);
  }
  const normalized = value.normalize('NFC');
  if (
    normalized.startsWith('/') ||
    normalized.startsWith('//') ||
    /^[a-z]:/i.test(normalized) ||
    path.posix.isAbsolute(normalized) ||
    normalized.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new Error(`Unsafe manifest path: ${JSON.stringify(value)}`);
  }
  return normalized;
}

export function resolveInside(root: string, relative: string): string {
  const normalized = normalizeManifestPath(relative);
  const candidate = path.resolve(root, ...normalized.split('/'));
  const relation = path.relative(path.resolve(root), candidate);
  if (relation === '..' || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    throw new Error(`Path escapes the installation: ${relative}`);
  }
  return candidate;
}

export async function assertNoSymlinkAncestors(root: string, relative: string): Promise<void> {
  const normalized = normalizeManifestPath(relative);
  let current = path.resolve(root);
  for (const part of normalized.split('/').slice(0, -1)) {
    current = path.join(current, part);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) throw new Error(`Refusing to follow symlink: ${current}`);
      if (!info.isDirectory()) throw new Error(`Path ancestor is not a directory: ${current}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
  }
}

export async function ensurePrivateDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) {
    throw new Error(`Updater workspace must be a real directory: ${directory}`);
  }
}

export async function canonicalRoot(root: string): Promise<string> {
  return realpath(path.resolve(root));
}

export function isDefaultAsset(relative: string): boolean {
  return relative.startsWith('public/assets/images/default/');
}

export function isForbiddenManagedImage(relative: string): boolean {
  return relative.startsWith('public/assets/images/') && !isDefaultAsset(relative);
}

export function isText(buffer: Buffer): boolean {
  if (buffer.includes(0)) return false;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return true;
  } catch {
    return false;
  }
}
