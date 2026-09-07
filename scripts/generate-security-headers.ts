import config from '../config/starrybio.config';
import { validateStarryBioConfig } from '../src/config/schema';
import { writeSecurityHeaders } from './security-headers';

const validatedConfig = validateStarryBioConfig(config);
writeSecurityHeaders(validatedConfig);
console.log('✓ Generated config-aware security headers');
