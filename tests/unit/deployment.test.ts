import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import {
  validateSecurityHeaders,
  writeSecurityHeaders,
  type SecurityHeaderTargets,
} from '../../scripts/security-headers';
import { buildSecurityHeaders } from '../../src/config/security-headers';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

async function targets(
  options: { headers?: boolean; vercel?: boolean } = {}
): Promise<SecurityHeaderTargets> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'starrybio-headers-'));
  temporaryDirectories.push(root);
  const result = {
    headersPath: path.join(root, 'public', '_headers'),
    vercelPath: path.join(root, 'vercel.json'),
  };
  if (options.headers) {
    await mkdir(path.dirname(result.headersPath), { recursive: true });
    await writeFile(result.headersPath, '/*\n  X-Old: stale\n');
  }
  if (options.vercel) {
    await writeFile(
      result.vercelPath,
      `${JSON.stringify({ headers: [{ source: '/(.*)', headers: [] }] }, null, 2)}\n`
    );
  }
  return result;
}

describe('config-aware deployment security', () => {
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

  test('updates whichever supported deployment files are present', async () => {
    for (const available of [
      { headers: true },
      { vercel: true },
      { headers: true, vercel: true },
    ]) {
      const output = await targets(available);
      const config = { analytics: { provider: 'none' as const } };
      writeSecurityHeaders(config, output);
      expect(validateSecurityHeaders(config, output)).toEqual([]);
    }
  });

  test('does not require configuration for deployment providers a user removed', async () => {
    const output = await targets();
    expect(validateSecurityHeaders({ analytics: { provider: 'none' } }, output)).toEqual([]);
    expect(() => writeSecurityHeaders({ analytics: { provider: 'none' } }, output)).not.toThrow();
  });

  test('reports malformed or stale generated platform configuration', async () => {
    const output = await targets({ headers: true, vercel: true });
    expect(validateSecurityHeaders({ analytics: { provider: 'none' } }, output)).toEqual([
      'public/_headers is stale; run "pnpm headers" and commit the result',
      'vercel.json security headers are stale; run "pnpm headers" and commit the result',
    ]);

    await writeFile(output.vercelPath, '{invalid json');
    const issues = validateSecurityHeaders({ analytics: { provider: 'none' } }, output);
    expect(issues.some((issue) => issue.includes('could not validate vercel.json'))).toBe(true);
    expect(await readFile(output.headersPath, 'utf8')).toContain('X-Old');
  });
});
