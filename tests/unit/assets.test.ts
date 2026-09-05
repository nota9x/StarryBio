import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createAnalyticsScript, serializeJsonAttribute } from '../../src/config/analytics';
import { normalizeStarryBioConfig, validateStarryBioConfig } from '../../src/config/schema';
import { createSimpleIconSvg } from '../../scripts/build-simple-icons';
import { createVCard, generateAssets } from '../../scripts/generate-assets';
import { createConfig } from './fixtures';

const outputDirectory = path.resolve('public/.vitest-output');

afterEach(async () => {
  await rm(outputDirectory, { force: true, recursive: true });
});

describe('deterministic build assets', () => {
  it('ships the status artwork as compact, native SVG assets', async () => {
    const imageDirectory = path.resolve('public/assets/images');
    const expectedAssets = ['online.svg', 'idle.svg', 'dnd.svg', 'offline.svg'];
    const files = await readdir(imageDirectory);

    expect(
      files.filter((file) => /\.(?:avif|bmp|gif|ico|jpe?g|png|tiff?|webp)$/i.test(file))
    ).toEqual([]);

    for (const filename of expectedAssets) {
      const svg = await readFile(path.join(imageDirectory, filename), 'utf8');
      expect(svg).toContain('viewBox="0 0 32 32"');
      expect(svg).toContain('<title');
      expect(svg).toContain('<desc');
      expect(svg).not.toContain('<image');
      expect(Buffer.byteLength(svg)).toBeLessThan(4_096);
    }
  });

  it('generates Simple Icons from the installed package with customization', async () => {
    const spec = {
      brand: 'GitHub',
      slug: 'github',
      color: 'ff0000',
      darkColor: '00ff00',
      viewbox: '0 0 24 24',
      size: '32',
    };
    const first = await createSimpleIconSvg(spec);
    expect(await createSimpleIconSvg(spec)).toBe(first);
    expect(first).toContain('<title>GitHub</title>');
    expect(first).toContain('fill="#ff0000"');
    expect(first).toContain('width="32"');
    await expect(createSimpleIconSvg({ ...spec, slug: 'not-a-real-icon' })).rejects.toThrow(
      /Unknown icon/
    );
  });

  it('removes stale generated files when generators are disabled', async () => {
    await mkdir(outputDirectory, { recursive: true });
    const outputs = ['og.png', 'qr.png', 'contact.vcf'];
    await Promise.all(outputs.map((file) => writeFile(path.join(outputDirectory, file), 'stale')));

    const config = normalizeStarryBioConfig(
      validateStarryBioConfig(
        createConfig({
          ogImage: { enabled: false, output: 'public/.vitest-output/og.png' },
          qr: { enabled: false, output: 'public/.vitest-output/qr.png' },
          contactCard: { enabled: false, output: 'public/.vitest-output/contact.vcf' },
        })
      )
    );
    await generateAssets(config);

    for (const file of outputs) {
      await expect(
        import('node:fs/promises').then((fs) => fs.stat(path.join(outputDirectory, file)))
      ).rejects.toThrow();
    }
  });

  it('generates a QR file even when its profile button is hidden', async () => {
    const output = path.join(outputDirectory, 'qr.png');
    const config = normalizeStarryBioConfig(
      validateStarryBioConfig(
        createConfig({
          qr: {
            enabled: true,
            showButton: false,
            url: 'https://example.com',
            output: 'public/.vitest-output/qr.png',
          },
        })
      )
    );

    await generateAssets(config);

    const details = await (await import('node:fs/promises')).stat(output);
    expect(details.size).toBeGreaterThan(0);
  });

  it('escapes injection characters and folds vCard lines to 75 UTF-8 bytes', () => {
    const config = normalizeStarryBioConfig(
      validateStarryBioConfig(
        createConfig({
          contactCard: {
            enabled: true,
            output: 'public/.vitest-output/contact.vcf',
            name: `Ada\r\nNOTE:Hacked, ${'É'.repeat(50)};`,
            email: 'mailto:ada@example.com',
          },
        })
      )
    );
    const vcard = createVCard(config);
    expect(vcard).toContain('FN:Ada\\nNOTE:Hacked\\,');
    expect(vcard).not.toMatch(/\r\nNOTE:Hacked/);
    expect(vcard).toContain('EMAIL:ada@example.com');
    for (const line of vcard.split('\r\n').filter(Boolean)) {
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
    }
  });
});

describe('analytics serialization', () => {
  it('escapes markup-significant JSON characters while preserving values', () => {
    const serialized = serializeJsonAttribute({ label: '</script>&' });
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual({ label: '</script>&' });
  });

  it('creates the Google descriptor without inline executable code', () => {
    const descriptor = createAnalyticsScript({
      provider: 'google',
      measurementId: 'G-ABC123',
      sendPageView: false,
      config: { campaign: 'release' },
    });
    expect(descriptor?.src).toContain('googletagmanager.com/gtag/js');
    expect(descriptor?.loading).toBe('async');
    expect(descriptor?.attrs).toMatchObject({
      'data-starrybio-provider': 'google',
      'data-measurement-id': 'G-ABC123',
      'data-send-page-view': 'false',
    });
  });

  it.each([
    [
      'cloudflare',
      { provider: 'cloudflare' as const, token: 'abc_123' },
      'https://static.cloudflareinsights.com/beacon.min.js',
      'module',
      'data-cf-beacon',
    ],
    [
      'plausible legacy',
      { provider: 'plausible' as const, domain: 'example.com' },
      'https://plausible.io/js/script.js',
      'defer',
      'data-domain',
    ],
    [
      'umami',
      {
        provider: 'umami' as const,
        websiteId: 'site_123',
        scriptSrc: 'https://analytics.umami.is/script.js',
      },
      'https://analytics.umami.is/script.js',
      'defer',
      'data-website-id',
    ],
  ])('creates the %s provider descriptor', (_name, config, src, loading, attribute) => {
    const descriptor = createAnalyticsScript(config);
    expect(descriptor).toMatchObject({ src, loading });
    expect(descriptor?.attrs).toHaveProperty(attribute);
  });

  it('supports Plausible per-site scripts without emitting the legacy domain attribute', () => {
    const descriptor = createAnalyticsScript({
      provider: 'plausible',
      scriptSrc: 'https://plausible.io/js/pa-ABC123.js',
    });
    expect(descriptor).toEqual({
      src: 'https://plausible.io/js/pa-ABC123.js',
      loading: 'defer',
      attrs: {},
    });
  });

  it('does not emit custom attributes that collide with internal analytics markers', () => {
    const descriptor = createAnalyticsScript({
      provider: 'custom',
      scriptSrc: 'https://analytics.example.com/script.js',
      dataAttributes: {
        provider: 'google',
        'starrybio-provider': 'google',
        'measurement-id': 'G-ABC123',
      },
    });
    expect(descriptor?.attrs).toEqual({ 'data-provider': 'google' });
    expect(descriptor?.attrs).not.toHaveProperty('data-starrybio-provider');
    expect(descriptor?.attrs).not.toHaveProperty('data-measurement-id');
  });
});
