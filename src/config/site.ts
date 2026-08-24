import rawConfig from '../../config/starrybio.config';
import { normalizeStarryBioConfig, validateStarryBioConfig } from './schema';

export const siteConfig = normalizeStarryBioConfig(validateStarryBioConfig(rawConfig));
