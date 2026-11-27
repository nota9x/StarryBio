import { loadConfig } from './load-config.ts';
import { validateStarryBioConfig } from '../src/config/schema.ts';
import { writeSecurityHeaders } from './security-headers.ts';

const config = await loadConfig();
const validatedConfig = validateStarryBioConfig(config);
writeSecurityHeaders(validatedConfig);
console.log('✓ Generated config-aware security headers');
