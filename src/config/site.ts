import rawConfig from 'virtual:starrybio-config';
import { normalizeStarryBioConfig, validateStarryBioConfig } from './schema';

export const siteConfig = normalizeStarryBioConfig(validateStarryBioConfig(rawConfig));
