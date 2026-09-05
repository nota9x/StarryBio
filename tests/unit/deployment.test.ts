import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

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

    expect(config).toMatchObject({
      framework: 'astro',
      installCommand: 'pnpm install --frozen-lockfile',
      buildCommand: 'pnpm build',
      outputDirectory: 'dist',
    });
  });

  test('keeps Vercel security headers aligned with _headers', () => {
    const config = readJson<VercelConfig>('vercel.json');
    const catchAll = config.headers.find(({ source }) => source === '/(.*)');

    expect(catchAll?.headers).toEqual(firstHeadersBlock());
  });

  test('keeps Netlify on the canonical build and output directory', () => {
    const config = readFileSync(resolve(root, 'netlify.toml'), 'utf8');

    expect(config).toMatch(/command\s*=\s*"pnpm build"/);
    expect(config).toMatch(/publish\s*=\s*"dist"/);
  });
});
