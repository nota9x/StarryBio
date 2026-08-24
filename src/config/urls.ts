export function externalLinkAttributes(url: string | undefined): {
  target?: '_blank';
  rel?: 'noopener noreferrer';
} {
  return /^https?:\/\//i.test(url || '') ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

export function toGeneratedAssetUrl(output: string | undefined, fallback: string): string {
  const value = (output || fallback).replace(/\\/g, '/');
  return `/${value.replace(/^public\//, '').replace(/^\/+/, '')}`;
}
