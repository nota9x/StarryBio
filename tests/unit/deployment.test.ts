import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import starryBioConfig from '../../config/starrybio.config';
import { buildSecurityHeaders } from '../../scripts/security-headers';
import { validateStarryBioConfig } from '../../src/config/schema';

const root = resolve(import.meta.dirname, '../..');

type Header = { key: string; value: string };
type VercelConfig = {
  framework: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  headers: { source: string; headers: Header[] }[];
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T;
}

function firstHeadersBlock(): Header[] {
  const source = readFileSync(resolve(root, 'public/_headers'), 'utf8');
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === '/*');
  if (start === -1) throw new Error('Expected a /* header block in public/_headers');
  const headers: Header[] = [];

  for (const line of lines.slice(start + 1)) {
    if (!/^\s/.test(line) || line.trim() === '') break;
    const separator = line.indexOf(':');
    if (separator <= 0) throw new Error(`Malformed header line in public/_headers: ${line}`);
    headers.push({
      key: line.slice(0, separator).trim(),
      value: line.slice(separator + 1).trim(),
    });
  }

  return headers;
}

describe('static deployment configuration', () => {
  test('keeps the Vercel build provider-neutral', () => {
    const config = readJson<VercelConfig>('vercel.json');
    const packageConfig = readJson<{ packageManager: string }>('package.json');
    const readme = readFileSync(resolve(root, 'README.md'), 'utf8');

    expect(config).toMatchObject({
      framework: 'astro',
      installCommand: 'pnpm install --frozen-lockfile',
      buildCommand: 'pnpm build',
      outputDirectory: 'dist',
    });
    expect(packageConfig.packageManager).toBe('pnpm@12.3.4');
    expect(readme).toContain('env=ENABLE_EXPERIMENTAL_COREPACK');
    expect(readme).toContain('%22ENABLE_EXPERIMENTAL_COREPACK%22%3A%221%22');
  });

  test('keeps Vercel security headers aligned with _headers', () => {
    const config = readJson<VercelConfig>('vercel.json');
    const catchAll = config.headers.find(({ source }) => source === '/(.*)');

    expect(catchAll?.headers).toEqual(firstHeadersBlock());
  });

  test('keeps deployment security headers aligned with the analytics config', () => {
    const expected = buildSecurityHeaders(validateStarryBioConfig(starryBioConfig));

    expect(firstHeadersBlock()).toEqual(expected);
    expect(expected).toContainEqual({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000',
    });
  });

  test('adds a custom analytics origin without broadly allowing HTTPS scripts', () => {
    const headers = buildSecurityHeaders({
      analytics: {
        provider: 'custom',
        scriptSrc: 'https://analytics.example.com/js/script.js',
      },
    });
    const policy = headers.find(({ key }) => key === 'Content-Security-Policy')?.value;

    expect(policy).toContain("script-src 'self' https://analytics.example.com");
    expect(policy).toContain("connect-src 'self' https://analytics.example.com");
    expect(policy).not.toContain('script-src https:');
    expect(policy).not.toContain('/js/script.js');
  });

  test('allows Umami Cloud’s separate collection endpoint', () => {
    const headers = buildSecurityHeaders({
      analytics: {
        provider: 'umami',
        websiteId: 'site-123',
        scriptSrc: 'https://cloud.umami.is/script.js',
      },
    });
    const policy = headers.find(({ key }) => key === 'Content-Security-Policy')?.value;

    expect(policy).toContain("script-src 'self' https://cloud.umami.is");
    expect(policy).toContain("connect-src 'self' https://cloud.umami.is https://gateway.umami.is");
  });

  test('keeps Netlify on the canonical build and output directory', () => {
    const config = readFileSync(resolve(root, 'netlify.toml'), 'utf8');

    expect(config).toMatch(/command\s*=\s*"pnpm build"/);
    expect(config).toMatch(/publish\s*=\s*"dist"/);
  });

  test('uses the official GitHub Pages artifact deployment flow', () => {
    const workflow = readFileSync(
      resolve(root, '.github/workflows/deploy-github-pages.yml'),
      'utf8'
    );

    expect(workflow).toMatch(/actions\/configure-pages@[\da-f]{40}/);
    expect(workflow).toMatch(/actions\/upload-pages-artifact@[\da-f]{40}/);
    expect(workflow).toMatch(/actions\/deploy-pages@[\da-f]{40}/);
    expect(workflow).toMatch(/node-version-file:\s*\.node-version/);
    expect(workflow).toMatch(/pnpm install --frozen-lockfile/);
    expect(workflow).toMatch(/path:\s*dist/);
    expect(workflow).toMatch(/pages:\s*write/);
    expect(workflow).toMatch(/id-token:\s*write/);
    expect(workflow).toMatch(/name:\s*github-pages/);
    expect(workflow).toMatch(/STARRYBIO_SITE_URL:\s*\$\{\{ steps\.pages\.outputs\.origin \}\}/);
    expect(workflow).toMatch(/STARRYBIO_BASE_PATH:\s*\$\{\{ steps\.pages\.outputs\.base_path \}\}/);
  });

  test('audits all dependencies and reviews dependency changes on pull requests', () => {
    const workflow = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8');

    expect(workflow).toMatch(/run:\s*pnpm audit(?:\s|$)/);
    expect(workflow).not.toContain('pnpm audit --prod');
    expect(workflow).toMatch(/actions\/dependency-review-action@[\da-f]{40}/);
  });

  test('validates pull request titles without the privileged target event', () => {
    const workflow = readFileSync(resolve(root, '.github/workflows/pr-title.yml'), 'utf8');

    expect(workflow).toMatch(/^\s*pull_request:\s*$/m);
    expect(workflow).not.toContain('pull_request_target:');
  });
});
