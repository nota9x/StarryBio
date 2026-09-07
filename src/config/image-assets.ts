import { toStaticAssetPath } from './urls';

export function toAbsoluteAssetPath(
  assetPath: string | undefined,
  base = import.meta.env.BASE_URL
): string {
  return toStaticAssetPath(assetPath?.replace(/\\/g, '/'), base);
}
