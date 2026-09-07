import { loadConfig } from './load-config';
import { validateStarryBioConfig } from '../src/config/schema';
import { writeSecurityHeaders } from './security-headers';

const config = await loadConfig();
const validatedConfig = validateStarryBioConfig(config);
writeSecurityHeaders(validatedConfig);
console.log('✓ Generated config-aware security headers');
