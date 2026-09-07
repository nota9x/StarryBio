export function externalLinkAttributes(url: string | undefined): {
  target?: '_blank';
  rel?: 'noopener noreferrer';
} {
  return /^https?:\/\//i.test(url || '') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function isNonSitePath(value: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(value);
}

function defaultBasePath(): string {
  return typeof process === 'undefined'
    ? import.meta.env.BASE_URL
    : process.env.STARRYBIO_BASE_PATH || import.meta.env.BASE_URL;
}

function withBasePath(value: string, base = import.meta.env.BASE_URL): string {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedValue = value.replace(/^\/+/, '');
  return `${normalizedBase}/${normalizedValue}`;
}

export function toSitePath(value: string | undefined, base = defaultBasePath()): string {
  if (!value || isNonSitePath(value) || !value.startsWith('/')) return value || '';
  return withBasePath(value, base);
}

export function toStaticAssetPath(value: string | undefined, base = defaultBasePath()): string {
  if (!value || isNonSitePath(value)) return value || '';
  return withBasePath(value.replace(/^public\//, ''), base);
}

export function toGeneratedAssetUrl(
  output: string | undefined,
  fallback: string,
  base = defaultBasePath()
): string {
  const value = (output || fallback).replace(/\\/g, '/');
  return toStaticAssetPath(value.replace(/^public\//, '').replace(/^\/+/, ''), base);
}
