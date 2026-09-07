import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StarryBioConfig } from '../src/config/schema';
import { buildSecurityHeaders, type SecurityHeader } from '../src/config/security-headers';

export { buildSecurityHeaders } from '../src/config/security-headers';

interface VercelConfig {
  headers: Array<{ source: string; headers: SecurityHeader[] }>;
}

const root = resolve(import.meta.dirname, '..');

export interface SecurityHeaderTargets {
  headersPath: string;
  vercelPath: string;
}

function defaultTargets(): SecurityHeaderTargets {
  return {
    headersPath: resolve(root, 'public/_headers'),
    vercelPath: resolve(root, 'vercel.json'),
  };
}

export function validateSecurityHeaders(
  config: Pick<StarryBioConfig, 'analytics'>,
  targets: SecurityHeaderTargets = defaultTargets()
): string[] {
  const expected = buildSecurityHeaders(config);
  const issues: string[] = [];

  if (existsSync(targets.headersPath)) {
    try {
      if (!headersEqual(readHeadersFile(targets.headersPath), expected)) {
        issues.push('public/_headers is stale; run "pnpm headers" and commit the result');
      }
    } catch (error) {
      issues.push(`could not validate public/_headers: ${errorMessage(error)}`);
    }
  }

  if (existsSync(targets.vercelPath)) {
    try {
      if (!headersEqual(readVercelHeaders(targets.vercelPath), expected)) {
        issues.push(
          'vercel.json security headers are stale; run "pnpm headers" and commit the result'
        );
      }
    } catch (error) {
      issues.push(`could not validate vercel.json security headers: ${errorMessage(error)}`);
    }
  }

  return issues;
}

export function writeSecurityHeaders(
  config: Pick<StarryBioConfig, 'analytics'>,
  targets: SecurityHeaderTargets = defaultTargets()
): void {
  const headers = buildSecurityHeaders(config);

  if (existsSync(targets.headersPath)) {
    const source = readFileSync(targets.headersPath, 'utf8');
    const newline = source.includes('\r\n') ? '\r\n' : '\n';
    const lines = source.split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim() === '/*');
    if (start === -1) throw new Error('Expected a /* header block in public/_headers');

    let end = start + 1;
    while (end < lines.length && /^\s+\S/.test(lines[end])) end += 1;
    const block = ['/*', ...headers.map(({ key, value }) => `  ${key}: ${value}`)];
    lines.splice(start, end - start, ...block);
    writeFileSync(targets.headersPath, lines.join(newline), 'utf8');
  }

  if (existsSync(targets.vercelPath)) {
    const vercel = readVercelConfig(targets.vercelPath);
    const catchAll = vercel.headers.find(({ source: pattern }) => pattern === '/(.*)');
    if (!catchAll) throw new Error('Expected a /(.*) header block in vercel.json');
    catchAll.headers = headers;
    writeFileSync(targets.vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, 'utf8');
  }
}

function readHeadersFile(headersPath: string): SecurityHeader[] {
  const source = readFileSync(headersPath, 'utf8');
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === '/*');
  if (start === -1) throw new Error('Expected a /* header block');
  const headers: SecurityHeader[] = [];

  for (const line of lines.slice(start + 1)) {
    if (!/^\s/.test(line) || line.trim() === '') break;
    const separator = line.indexOf(':');
    if (separator <= 0) throw new Error(`Malformed header line: ${line}`);
    headers.push({
      key: line.slice(0, separator).trim(),
      value: line.slice(separator + 1).trim(),
    });
  }

  return headers;
}

function readVercelHeaders(vercelPath: string): SecurityHeader[] {
  const config = readVercelConfig(vercelPath);
  const catchAll = config.headers.find(({ source }) => source === '/(.*)');
  if (!catchAll) throw new Error('Expected a /(.*) header block');
  return catchAll.headers;
}

function readVercelConfig(vercelPath: string): VercelConfig {
  return JSON.parse(readFileSync(vercelPath, 'utf8')) as VercelConfig;
}

function headersEqual(left: SecurityHeader[], right: SecurityHeader[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
