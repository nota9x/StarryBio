import config from '../config/starrybio.config';
import { validateLocalAssetPaths } from './config-utils';
import { StarryBioConfigError, validateStarryBioConfig } from '../src/config/schema';

try {
  console.log('✓ Loaded config');
  const validatedConfig = validateStarryBioConfig(config);
  const assetIssues = validateLocalAssetPaths(validatedConfig);

  if (assetIssues.length > 0) {
    throw new StarryBioConfigError(assetIssues);
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
