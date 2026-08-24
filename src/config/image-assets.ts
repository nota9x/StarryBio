export function toAbsoluteAssetPath(assetPath: string | undefined): string {
  if (!assetPath) return '';
  if (/^(?:https?:|data:|\/)/.test(assetPath)) return assetPath;
  return `/${assetPath.replace(/\\/g, '/')}`;
}
