import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(root, file), 'utf8')) as T;
}

describe('StarryBio maintainer repository policy', () => {
  test('keeps the published Vercel starter metadata canonical', () => {
    const config = readJson<Record<string, unknown>>('vercel.json');
    const packageConfig = readJson<{ packageManager: string }>('package.json');
    const readme = readFileSync(resolve(root, 'README.md'), 'utf8');

    expect(config).toMatchObject({
      framework: 'astro',
      installCommand: 'pnpm install --frozen-lockfile',
      buildCommand: 'pnpm build',
      outputDirectory: 'dist',
    });
    expect(packageConfig.packageManager).toMatch(/^pnpm@12\.\d+\.\d+$/);
    expect(readme).toContain('env=ENABLE_EXPERIMENTAL_COREPACK');
    expect(readme).toContain('%22ENABLE_EXPERIMENTAL_COREPACK%22%3A%221%22');
  });

  test('keeps the published Netlify starter metadata canonical', () => {
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
    expect(workflow).toMatch(/STARRYBIO_SITE_URL:\s*\$\{\{ steps\.pages\.outputs\.origin \}\}/);
    expect(workflow).toMatch(/STARRYBIO_BASE_PATH:\s*\$\{\{ steps\.pages\.outputs\.base_path \}\}/);
  });

  test('keeps maintainer security and pull-request policy enabled', () => {
    const ci = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8');
    const titles = readFileSync(resolve(root, '.github/workflows/pr-title.yml'), 'utf8');

    expect(ci).toMatch(/run:\s*pnpm audit(?:\s|$)/);
    expect(ci).toMatch(/actions\/dependency-review-action@[\da-f]{40}/);
    expect(titles).toMatch(/^\s*pull_request:\s*$/m);
    expect(titles).not.toContain('pull_request_target:');
  });
});
