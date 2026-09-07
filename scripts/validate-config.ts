import config from '../config/starrybio.config';
import { validateLocalAssetPaths } from './config-utils';
import { validateSecurityHeaders } from './security-headers';
import { StarryBioConfigError, validateStarryBioConfig } from '../src/config/schema';

try {
  console.log('✓ Loaded config');
  const validatedConfig = validateStarryBioConfig(config);
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
