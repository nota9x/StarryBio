import { describe, expect, it } from 'vitest';
import { getLegacyThemeWarning } from '../../scripts/validate-config';
import { validateStarryBioConfig } from '../../src/config/schema';
import { createConfig } from './fixtures';

describe('configuration warnings', () => {
  it('describes the safe replacement for a legacy theme', () => {
    const config = validateStarryBioConfig(createConfig({ theme: 'event-horizon' }));
    expect(getLegacyThemeWarning(config)).toContain('"event-horizon" is deprecated');
    expect(getLegacyThemeWarning(config)).toContain('"black-hole"');
  });

  it('does not warn for active themes', () => {
    const config = validateStarryBioConfig(createConfig({ theme: 'eclipse' }));
    expect(getLegacyThemeWarning(config)).toBeUndefined();
  });
});
