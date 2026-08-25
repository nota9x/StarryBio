import { describe, expect, it } from 'vitest';
import {
  isVisible,
  normalizeStarryBioConfig,
  StarryBioConfigError,
  validateStarryBioConfig,
} from '../../src/config/schema';
import { getThemeStyle } from '../../src/config/themes';
import { createConfig, createStatus } from './fixtures';

describe('StarryBio v3 configuration', () => {
  it('requires sections and link labels', () => {
    expect(() => validateStarryBioConfig(createConfig({ sections: undefined }))).toThrow(
      /sections/
    );
    expect(() =>
      validateStarryBioConfig(
        createConfig({ sections: [{ title: 'Links', links: [{ url: '/', text: 'Legacy' }] }] })
      )
    ).toThrow(/sections\.0\.links\.0\.(?:label|text)/);
  });

  it.each([
    ['top-level links', { links: [{ label: 'Legacy', url: '/' }] }],
    ['bright theme alias', { theme: 'bright' }],
    ['showLocalTime', { status: { ...createStatus(), showLocalTime: true } }],
    ['showOwnerLocalTime', { status: { ...createStatus(), showOwnerLocalTime: true } }],
  ])('rejects removed %s configuration', (_name, legacy) => {
    expect(() => validateStarryBioConfig(createConfig(legacy))).toThrow(StarryBioConfigError);
  });

  it('applies v3 defaults during normalization', () => {
    const normalized = normalizeStarryBioConfig(validateStarryBioConfig(createConfig()));
    expect(normalized.theme).toMatchObject({
      preset: 'midnight',
      mode: 'dark',
      buttonStyle: 'glass',
      background: 'starfield',
    });
    expect(normalized.layout).toMatchObject({ mode: 'centered', featuredPosition: 'above-links' });
    expect(normalized.analytics).toEqual({ provider: 'none' });
  });

  it('supports the restored Classic Blue theme preset', () => {
    const normalized = normalizeStarryBioConfig(
      validateStarryBioConfig(createConfig({ theme: 'classic-blue' }))
    );

    expect(normalized.theme).toMatchObject({
      preset: 'classic-blue',
      accent: '#b0c4de',
      mode: 'dark',
      background: 'starfield',
    });
    expect(getThemeStyle(normalized.theme)).toContain(
      '--bg-color: linear-gradient(135deg, #0b1c36 0%, #1a2a4d 40%, #2a3b65 100%)'
    );
    expect(getThemeStyle(normalized.theme)).toContain(
      '--announcement-bg: rgba(251, 191, 36, 0.25)'
    );
  });

  it('keeps QR generation and profile-button visibility independent', () => {
    const generatedOnly = normalizeStarryBioConfig(
      validateStarryBioConfig(
        createConfig({ qr: { enabled: true, showButton: false, url: 'https://example.com' } })
      )
    );
    const legacyConfig = normalizeStarryBioConfig(
      validateStarryBioConfig(createConfig({ qr: { enabled: true, url: 'https://example.com' } }))
    );

    expect(generatedOnly.qr).toMatchObject({ enabled: true, showButton: false });
    expect(legacyConfig.qr).toMatchObject({ enabled: true, showButton: true });
  });

  it.each([
    ['nebula', '#6d28d9', '#251d33'],
    ['midnight', '#3e6085', '#172335'],
    ['classic-blue', '#285b9e', '#112844'],
    ['aurora', '#167346', '#143324'],
    ['eclipse', '#9a4d0a', '#3c271e'],
    ['cosmic-gold', '#80600c', '#3b2f15'],
    ['minimal', '#334155', '#121826'],
    ['terminal', '#147532', '#153a20'],
  ] as const)('provides a complete light palette for %s', (preset, accent, text) => {
    const normalized = normalizeStarryBioConfig(
      validateStarryBioConfig(createConfig({ theme: { preset, mode: 'light' } }))
    );
    const style = getThemeStyle(normalized.theme);

    expect(normalized.theme.accent).toBe(accent);
    expect(style).toContain(`--text-color: ${text}`);
    expect(style).toContain(`--focus-color: ${accent}`);
    expect(style).toContain('--announcement-bg:');
    expect(style).toContain('--img-border:');
  });

  it('provides a true dark palette for Minimal and preserves custom accents', () => {
    const darkMinimal = normalizeStarryBioConfig(
      validateStarryBioConfig(createConfig({ theme: { preset: 'minimal', mode: 'dark' } }))
    );
    const custom = normalizeStarryBioConfig(
      validateStarryBioConfig(
        createConfig({ theme: { preset: 'aurora', mode: 'light', accent: '#123456' } })
      )
    );

    expect(darkMinimal.theme.accent).toBe('#b8c4d4');
    expect(getThemeStyle(darkMinimal.theme)).toContain('--text-color: #edf2f7');
    expect(custom.theme.accent).toBe('#123456');
    expect(getThemeStyle(custom.theme)).toContain('--accent-color: #123456');
  });

  it('requires an owner timezone only when the owner clock is enabled', () => {
    expect(() =>
      validateStarryBioConfig(createConfig({ status: { ...createStatus(), showOwnerTime: true } }))
    ).toThrow(/ownerTimeZone/);
    expect(() =>
      validateStarryBioConfig(createConfig({ status: { ...createStatus(), showOwnerTime: false } }))
    ).not.toThrow();
  });

  it('rejects unknown properties, unsafe assets, protocols, and output extensions', () => {
    expect(() => validateStarryBioConfig(createConfig({ surprise: true }))).toThrow(/surprise/);
    expect(() =>
      validateStarryBioConfig(
        createConfig({ profile: { name: 'A', description: 'B', image: '../secret.png' } })
      )
    ).toThrow(/profile\.image/);
    expect(() =>
      validateStarryBioConfig(
        createConfig({
          profile: { name: 'A', description: 'B', image: 'assets/%2e%2e/secret.png' },
        })
      )
    ).toThrow(/profile\.image/);
    expect(() =>
      validateStarryBioConfig(
        createConfig({
          sections: [{ title: 'Links', links: [{ label: 'Bad', url: 'javascript:x' }] }],
        })
      )
    ).toThrow(/sections\.0\.links\.0\.url/);
    expect(() =>
      validateStarryBioConfig(
        createConfig({ qr: { enabled: true, url: 'https://example.com', output: 'public/qr.jpg' } })
      )
    ).toThrow(/qr\.output/);
    expect(() =>
      validateStarryBioConfig(createConfig({ ogImage: { enabled: true, output: '../og.png' } }))
    ).toThrow(/ogImage\.output/);
  });

  it('validates visibility windows and uses an exclusive end boundary', () => {
    expect(() =>
      validateStarryBioConfig(
        createConfig({
          sections: [
            {
              title: 'Links',
              visibleFrom: '2026-08-24T12:00:00Z',
              visibleUntil: '2026-08-24T11:00:00Z',
              links: [{ label: 'Home', url: '/' }],
            },
          ],
        })
      )
    ).toThrow(/visibleUntil/);
    expect(
      isVisible({ visibleFrom: '2026-08-24T12:00:00Z' }, Date.parse('2026-08-24T11:59:59Z'))
    ).toBe(false);
    expect(
      isVisible({ visibleUntil: '2026-08-24T12:00:00Z' }, Date.parse('2026-08-24T12:00:00Z'))
    ).toBe(false);
  });

  it('accepts local, hash, mail, phone, and HTTP links', () => {
    const urls = [
      '/',
      'about',
      '#contact',
      'mailto:test@example.com',
      'tel:+15551234567',
      'https://example.com',
    ];
    for (const url of urls) {
      expect(() =>
        validateStarryBioConfig(
          createConfig({ sections: [{ title: 'Links', links: [{ label: url, url }] }] })
        )
      ).not.toThrow();
    }
  });

  it('rejects invalid analytics identifiers and unsafe custom attributes', () => {
    expect(() =>
      validateStarryBioConfig(
        createConfig({ analytics: { provider: 'google', measurementId: 'UA-123' } })
      )
    ).toThrow(/measurementId/);
    expect(() =>
      validateStarryBioConfig(
        createConfig({
          analytics: {
            provider: 'custom',
            scriptSrc: 'https://analytics.example.com/script.js',
            dataAttributes: { 'bad name': 'value' },
          },
        })
      )
    ).toThrow(/dataAttributes/);
    expect(() =>
      validateStarryBioConfig(
        createConfig({
          analytics: {
            provider: 'custom',
            scriptSrc: 'https://analytics.example.com/script.js',
            dataAttributes: { 'starrybio-provider': 'google' },
          },
        })
      )
    ).toThrow(/reserved StarryBio analytics attribute/);
  });

  it('accepts both current and legacy Plausible installation formats', () => {
    expect(() =>
      validateStarryBioConfig(
        createConfig({
          analytics: {
            provider: 'plausible',
            scriptSrc: 'https://plausible.io/js/pa-ABC123.js',
          },
        })
      )
    ).not.toThrow();
    expect(() =>
      validateStarryBioConfig(
        createConfig({ analytics: { provider: 'plausible', domain: 'example.com' } })
      )
    ).not.toThrow();
    expect(() =>
      validateStarryBioConfig(createConfig({ analytics: { provider: 'plausible' } }))
    ).toThrow(/scriptSrc/);
  });
});
