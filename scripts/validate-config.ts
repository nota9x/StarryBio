import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateLocalAssetPaths } from './config-utils';
import { loadConfig } from './load-config';
import { validateSecurityHeaders } from './security-headers';
import { StarryBioConfigError, validateStarryBioConfig } from '../src/config/schema';
import { LEGACY_THEME_PRESET_ALIASES, isLegacyThemePreset } from '../src/config/themes';

export function getLegacyThemeWarning(
  config: ReturnType<typeof validateStarryBioConfig>
): string | undefined {
  const preset = typeof config.theme === 'string' ? config.theme : config.theme?.preset;
  if (!preset || !isLegacyThemePreset(preset)) return undefined;
  return `Theme "${preset}" is deprecated and now renders as "${LEGACY_THEME_PRESET_ALIASES[preset]}". Update config/starrybio.config.ts to use the replacement name.`;
}

export async function main(): Promise<void> {
  try {
    const config = await loadConfig();
    console.log('✓ Loaded config');
    const validatedConfig = validateStarryBioConfig(config);
    const themeWarning = getLegacyThemeWarning(validatedConfig);
    if (themeWarning) console.warn(`⚠ ${themeWarning}`);
    const assetIssues = validateLocalAssetPaths(validatedConfig);
    const securityHeaderIssues = validateSecurityHeaders(validatedConfig);
    const issues = [...assetIssues, ...securityHeaderIssues];

    if (issues.length > 0) {
      throw new StarryBioConfigError(issues);
    }

    console.log('✓ Validated config');
  } catch (error) {
    if (error instanceof StarryBioConfigError) {
      console.error(error.message);
    } else {
      console.error(error instanceof Error ? error.message : error);
    }
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  void main();
}
