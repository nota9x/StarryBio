import type { ImageMetadata } from 'astro';

type ImageModule = { default: ImageMetadata };

const localImages = import.meta.glob<ImageModule>('../assets/images/**/*', { eager: true });
const LOCAL_IMAGE_PREFIX = 'assets/images/';
const SVG_PATH_RE = /^(?:\s*M|\s*<path\b)/i;

export function resolveImageAsset(assetPath: string | undefined): ImageMetadata | string {
  if (!assetPath) return '';
  if (!isLocalImagePath(assetPath)) return toAbsoluteAssetPath(assetPath);

  const key = `../${normalizeAssetPath(assetPath)}`;
  return localImages[key]?.default || toAbsoluteAssetPath(assetPath);
}

export function toAbsoluteAssetPath(assetPath: string | undefined): string {
  if (!assetPath) return '';
  if (/^(?:https?:|data:|\/)/.test(assetPath)) return assetPath;
  return `/${assetPath}`;
}

export function isImageMetadata(value: ImageMetadata | string): value is ImageMetadata {
  return typeof value === 'object' && value !== null && 'src' in value;
}

export function isLocalImagePath(value: string): boolean {
  const normalized = normalizeAssetPath(value);
  return normalized.startsWith(LOCAL_IMAGE_PREFIX) && !isExternalOrInline(value);
}

export function isSvgImagePath(value: string): boolean {
  return /\.svg(?:[?#].*)?$/i.test(value);
}

function normalizeAssetPath(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

function isExternalOrInline(value: string): boolean {
  if (value.startsWith('data:')) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return true;
  return SVG_PATH_RE.test(value);
}
