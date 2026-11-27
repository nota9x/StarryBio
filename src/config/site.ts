import rawConfig from 'virtual:starrybio-config';
import { normalizeStarryBioConfig, validateStarryBioConfig } from './schema.ts';

export const siteConfig = normalizeStarryBioConfig(validateStarryBioConfig(rawConfig));
