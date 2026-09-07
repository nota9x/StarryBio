import { toStaticAssetPath } from './urls';

export function toAbsoluteAssetPath(assetPath: string | undefined, base?: string): string {
  return toStaticAssetPath(assetPath?.replace(/\\/g, '/'), base);
}
