import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function resolveConfigPath(value = process.env.STARRYBIO_CONFIG_PATH): string {
  return path.resolve(value || 'config/starrybio.config.ts');
}

export async function loadConfig(value?: string): Promise<unknown> {
  const configPath = resolveConfigPath(value);
  const loaded = (await import(pathToFileURL(configPath).href)) as { default?: unknown };
  if (loaded.default === undefined) {
    throw new Error(`${configPath} must have a default export.`);
  }
  return loaded.default;
}
