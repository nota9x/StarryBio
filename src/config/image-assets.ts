import { toStaticAssetPath } from './urls.ts';

export function toAbsoluteAssetPath(assetPath: string | undefined, base?: string): string {
  return toStaticAssetPath(assetPath?.replace(/\\/g, '/'), base);
}
