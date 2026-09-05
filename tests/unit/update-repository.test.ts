import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { matchesGlob, parseArgs } from '../../scripts/update-repository';

const temporaryDirectories: string[] = [];

function temporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), 'starrybio-updater-'));
  temporaryDirectories.push(directory);
  return directory;
}

function git(directory: string, ...args: string[]) {
  const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return result.stdout.trim();
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe('repository updater options', () => {
  it('preserves README.md with local conflict resolution by default', () => {
    const options = parseArgs([], temporaryDirectory());

    expect(options.conflictStrategy).toBe('local');
    expect(options.skip).toEqual(['README.md']);
    expect(options.help).toBe(false);
  });

  it('combines persistent config with command-line overrides', () => {
    const directory = temporaryDirectory();
    writeFileSync(
      join(directory, '.starrybio-updater.json'),
      JSON.stringify({ conflictStrategy: 'upstream', skip: ['config/**'] })
    );

    const options = parseArgs(['--conflicts', 'local', '--skip', 'public/assets/**'], directory);

    expect(options.conflictStrategy).toBe('local');
    expect(options.skip).toEqual(['README.md', 'config/**', 'public/assets/**']);
  });

  it('can disable both config and default skips', () => {
    const directory = temporaryDirectory();
    writeFileSync(
      join(directory, '.starrybio-updater.json'),
      JSON.stringify({ skip: ['config/**'] })
    );

    const options = parseArgs(['--no-config', '--no-default-skips'], directory);

    expect(options.skip).toEqual([]);
    expect(options.configFile).toBeUndefined();
  });

  it('rejects unknown config options instead of silently ignoring mistakes', () => {
    const directory = temporaryDirectory();
    writeFileSync(
      join(directory, '.starrybio-updater.json'),
      JSON.stringify({ skips: ['README.md'] })
    );

    expect(() => parseArgs([], directory)).toThrow('Unknown option');
  });
});

describe('repository updater globs', () => {
  it.each([
    ['README.md', 'README.md', true],
    ['config/starrybio.config.ts', 'config/**', true],
    ['config/nested/theme.ts', 'config/**', true],
    ['src/config/site.ts', 'config/**', false],
    ['public/assets/profile.svg', '**/*.svg', true],
    ['public/assets/profile.png', '**/*.svg', false],
    ['docs/setup.md', 'docs/', true],
  ])('matches %s against %s', (path, pattern, expected) => {
    expect(matchesGlob(path, pattern)).toBe(expected);
  });
});

describe('repository updater integration', () => {
  it('resolves content and lockfile conflicts, preserves skips, and runs pnpm up', () => {
    const root = temporaryDirectory();
    const upstream = join(root, 'upstream');
    const installation = join(root, 'installation');
    mkdirSync(upstream);
    git(upstream, 'init', '--initial-branch=main');
    git(upstream, 'config', 'user.name', 'Updater Test');
    git(upstream, 'config', 'user.email', 'updater@example.test');
    writeFileSync(join(upstream, 'README.md'), 'base readme\n');
    writeFileSync(join(upstream, 'app.txt'), 'base app\n');
    writeFileSync(join(upstream, '.gitignore'), 'node_modules/\n');
    writeFileSync(
      join(upstream, 'package.json'),
      JSON.stringify({ private: true, packageManager: 'pnpm@11.25.0' })
    );
    const baseLockfile = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: false
  excludeLinksFromLockfile: false

importers:

  .: {}

# base
`;
    writeFileSync(join(upstream, 'pnpm-lock.yaml'), baseLockfile);
    git(upstream, 'add', '.');
    git(upstream, 'commit', '-m', 'base');

    git(root, 'clone', upstream, installation);
    git(installation, 'config', 'user.name', 'Installation Test');
    git(installation, 'config', 'user.email', 'installation@example.test');
    writeFileSync(join(installation, 'app.txt'), 'local app\n');
    writeFileSync(join(installation, 'pnpm-lock.yaml'), baseLockfile.replace('# base', '# local'));
    git(installation, 'add', '.');
    git(installation, 'commit', '-m', 'customize installation');

    writeFileSync(join(upstream, 'README.md'), 'upstream readme\n');
    writeFileSync(join(upstream, 'app.txt'), 'upstream app\n');
    writeFileSync(join(upstream, 'pnpm-lock.yaml'), baseLockfile.replace('# base', '# upstream'));
    git(upstream, 'add', '.');
    git(upstream, 'commit', '-m', 'upstream update');
    const upstreamHead = git(upstream, 'rev-parse', 'HEAD');

    const result = spawnSync(
      process.execPath,
      [
        resolve('node_modules/tsx/dist/cli.mjs'),
        resolve('scripts/update-repository.ts'),
        '--remote',
        'upstream',
        '--remote-url',
        upstream,
        '--branch',
        'main',
      ],
      { cwd: installation, encoding: 'utf8' }
    );

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(readFileSync(join(installation, 'README.md'), 'utf8').trim()).toBe('base readme');
    expect(readFileSync(join(installation, 'app.txt'), 'utf8').trim()).toBe('local app');
    expect(readFileSync(join(installation, 'pnpm-lock.yaml'), 'utf8')).not.toContain('# local');
    expect(result.stdout).toContain('Updating dependencies and regenerating the lockfile');
    expect(git(installation, 'status', '--porcelain')).toBe('M pnpm-lock.yaml');
    expect(() =>
      git(installation, 'merge-base', '--is-ancestor', upstreamHead, 'HEAD')
    ).not.toThrow();
    expect(git(installation, 'log', '-1', '--format=%s')).toBe(
      'chore(update): preserve skipped files'
    );
  }, 15_000);
});
