import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_REMOTE = 'starrybio';
const DEFAULT_REMOTE_URL = 'https://github.com/nota9x/StarryBio.git';
const DEFAULT_CONFIG = '.starrybio-updater.json';
const DEFAULT_SKIPS = ['README.md'];

export type ConflictStrategy = 'local' | 'upstream' | 'abort';
export type Options = {
  branch?: string;
  conflictStrategy: ConflictStrategy;
  configFile?: string;
  dryRun: boolean;
  help: boolean;
  remote: string;
  remoteUrl: string;
  skip: string[];
  useDefaultSkips: boolean;
};
type UpdaterConfig = Partial<
  Pick<Options, 'branch' | 'conflictStrategy' | 'remote' | 'remoteUrl' | 'skip' | 'useDefaultSkips'>
>;
type GitResult = { ok: boolean; stderr: string; stdout: string };

function requireValue(args: string[], index: number) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${args[index]}.`);
  return value;
}

function readConfig(configFile: string, required: boolean): UpdaterConfig {
  if (!existsSync(configFile)) {
    if (required) throw new Error(`Updater config not found: ${configFile}`);
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(configFile, 'utf8'));
  } catch (error) {
    throw new Error(
      `Could not parse ${configFile}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${configFile} must contain a JSON object.`);
  }

  const config = parsed as Record<string, unknown>;
  const allowed = new Set([
    'branch',
    'conflictStrategy',
    'remote',
    'remoteUrl',
    'skip',
    'useDefaultSkips',
  ]);
  const unknown = Object.keys(config).filter((key) => !allowed.has(key));
  if (unknown.length) throw new Error(`Unknown option in ${configFile}: ${unknown.join(', ')}`);

  for (const key of ['branch', 'remote', 'remoteUrl'] as const) {
    if (config[key] !== undefined && typeof config[key] !== 'string') {
      throw new Error(`${configFile}: "${key}" must be a string.`);
    }
  }
  for (const key of ['useDefaultSkips'] as const) {
    if (config[key] !== undefined && typeof config[key] !== 'boolean') {
      throw new Error(`${configFile}: "${key}" must be a boolean.`);
    }
  }
  if (
    config.conflictStrategy !== undefined &&
    !['local', 'upstream', 'abort'].includes(String(config.conflictStrategy))
  ) {
    throw new Error(`${configFile}: "conflictStrategy" must be local, upstream, or abort.`);
  }
  if (
    config.skip !== undefined &&
    (!Array.isArray(config.skip) || config.skip.some((entry) => typeof entry !== 'string'))
  ) {
    throw new Error(`${configFile}: "skip" must be an array of glob strings.`);
  }
  return config as UpdaterConfig;
}

export function parseArgs(args: string[], cwd = process.cwd()): Options {
  let configFile: string | undefined;
  let useConfig = true;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--config') {
      configFile = resolve(cwd, requireValue(args, index));
      index += 1;
    } else if (args[index] === '--no-config') useConfig = false;
  }
  if (configFile && !useConfig) throw new Error('--config and --no-config cannot be combined.');

  const resolvedConfig = configFile ?? resolve(cwd, DEFAULT_CONFIG);
  const config = useConfig ? readConfig(resolvedConfig, Boolean(configFile)) : {};
  const options: Options = {
    conflictStrategy: config.conflictStrategy ?? 'local',
    configFile: useConfig && existsSync(resolvedConfig) ? resolvedConfig : undefined,
    dryRun: false,
    help: false,
    remote: config.remote ?? DEFAULT_REMOTE,
    remoteUrl: config.remoteUrl ?? DEFAULT_REMOTE_URL,
    skip: [...(config.skip ?? [])],
    useDefaultSkips: config.useDefaultSkips ?? true,
    ...(config.branch ? { branch: config.branch } : {}),
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--no-default-skips') options.useDefaultSkips = false;
    else if (argument === '--config') index += 1;
    else if (argument === '--no-config') continue;
    else if (['--remote', '--remote-url', '--branch', '--conflicts', '--skip'].includes(argument)) {
      const value = requireValue(args, index);
      index += 1;
      if (argument === '--remote') options.remote = value;
      else if (argument === '--remote-url') options.remoteUrl = value;
      else if (argument === '--branch') options.branch = value;
      else if (argument === '--skip') options.skip.push(value);
      else if (['local', 'upstream', 'abort'].includes(value)) {
        options.conflictStrategy = value as ConflictStrategy;
      } else throw new Error('--conflicts must be local, upstream, or abort.');
    } else throw new Error(`Unknown argument: ${argument}`);
  }

  const skip = [...(options.useDefaultSkips ? DEFAULT_SKIPS : []), ...options.skip]
    .map((pattern) => pattern.replaceAll('\\', '/').replace(/^\.\//, ''))
    .filter(Boolean);
  options.skip = [...new Set(skip)];
  return options;
}

function git(args: string[], capture = false, extraEnv?: NodeJS.ProcessEnv): GitResult {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
    stdio: capture ? 'pipe' : 'inherit',
  });
  return {
    ok: result.status === 0,
    stderr: result.stderr?.trim() ?? '',
    stdout: result.stdout?.trim() ?? '',
  };
}

function gitOutput(args: string[]) {
  const result = git(args, true);
  if (!result.ok) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return result.stdout;
}

function hasGitDirEntry(name: string) {
  const path = git(['rev-parse', '--git-path', name], true);
  return path.ok && existsSync(path.stdout);
}

function assertRepositoryReady() {
  if (!git(['rev-parse', '--is-inside-work-tree'], true).ok) {
    throw new Error('Run this command inside a Git working tree.');
  }
  const branch = gitOutput(['branch', '--show-current']);
  if (!branch)
    throw new Error('Updates require a checked-out branch; detached HEAD is not supported.');
  const operations = [
    ['rebase-merge', 'rebase'],
    ['rebase-apply', 'rebase'],
    ['MERGE_HEAD', 'merge'],
    ['CHERRY_PICK_HEAD', 'cherry-pick'],
    ['REVERT_HEAD', 'revert'],
  ] as const;
  const active = operations.find(([entry]) => hasGitDirEntry(entry));
  if (active) throw new Error(`Finish or abort the active ${active[1]} before updating.`);
  return branch;
}

function remoteExists(remote: string) {
  return git(['remote', 'get-url', remote], true).ok;
}

function resolveRemoteBranch(remote: string, requested?: string) {
  if (requested) return requested;
  const symbolic = git(['symbolic-ref', '--quiet', '--short', `refs/remotes/${remote}/HEAD`], true);
  if (symbolic.ok && symbolic.stdout.startsWith(`${remote}/`)) {
    return symbolic.stdout.slice(remote.length + 1);
  }
  for (const candidate of ['main', 'master']) {
    if (git(['show-ref', '--verify', '--quiet', `refs/remotes/${remote}/${candidate}`], true).ok) {
      return candidate;
    }
  }
  throw new Error(`Could not determine ${remote}'s default branch. Pass --branch <name>.`);
}

function abortInProgress() {
  git(['rebase', '--abort'], true);
  git(['merge', '--abort'], true);
}

function createBackupRef(head: string) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const ref = `refs/starrybio-update-backups/${timestamp}-${head.slice(0, 8)}`;
  if (!git(['update-ref', ref, head]).ok) throw new Error('Could not create the recovery ref.');
  return ref;
}

function stashChanges() {
  const dirty = gitOutput(['status', '--porcelain=v1', '--untracked-files=all']);
  if (!dirty) return undefined;
  const message = `starrybio-update ${new Date().toISOString()}`;
  if (!git(['stash', 'push', '--include-untracked', '--message', message]).ok) {
    throw new Error('Could not stash local changes; no update was attempted.');
  }
  return gitOutput(['rev-parse', 'refs/stash']);
}

function unmergedPaths() {
  const result = git(['diff', '--name-only', '--diff-filter=U', '-z'], true);
  return result.ok ? result.stdout.split('\0').filter(Boolean) : [];
}

function stageExists(stage: 2 | 3, path: string) {
  return git(['cat-file', '-e', `:${stage}:${path}`], true).ok;
}

function resolvePath(path: string, stage: 2 | 3) {
  if (stageExists(stage, path)) {
    const side = stage === 2 ? '--ours' : '--theirs';
    return git(['checkout', side, '--', path], true).ok && git(['add', '--', path], true).ok;
  }
  return git(['rm', '-f', '--ignore-unmatch', '--', path], true).ok;
}

function escapeRegExp(value: string) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

export function matchesGlob(path: string, pattern: string) {
  const normalizedPath = path.replaceAll('\\', '/');
  let normalizedPattern = pattern.replaceAll('\\', '/').replace(/^\.\//, '');
  if (normalizedPattern.endsWith('/')) normalizedPattern += '**';
  let expression = '';
  for (let index = 0; index < normalizedPattern.length; index += 1) {
    const character = normalizedPattern[index];
    if (character === '*' && normalizedPattern[index + 1] === '*') {
      if (normalizedPattern[index + 2] === '/') {
        expression += '(?:.*/)?';
        index += 2;
      } else {
        expression += '.*';
        index += 1;
      }
    } else if (character === '*') expression += '[^/]*';
    else if (character === '?') expression += '[^/]';
    else expression += escapeRegExp(character);
  }
  return new RegExp(`^${expression}$`).test(normalizedPath);
}

function matchesSkipped(path: string, patterns: string[]) {
  return patterns.some((pattern) => matchesGlob(path, pattern));
}

function isDependencyLockfile(path: string) {
  return path.replaceAll('\\', '/') === 'pnpm-lock.yaml';
}

function resolveConflicts(
  paths: string[],
  strategy: Exclude<ConflictStrategy, 'abort'>,
  operation: 'rebase' | 'merge' | 'stash',
  skip: string[]
) {
  for (const path of paths) {
    // The lockfile is regenerated with `pnpm up`, so never let one of its conflicts block updates.
    const choice = isDependencyLockfile(path)
      ? 'upstream'
      : matchesSkipped(path, skip)
        ? 'local'
        : strategy;
    // During a rebase stage 2 is upstream and stage 3 is the local commit being replayed.
    const localStage = operation === 'rebase' ? 3 : operation === 'merge' ? 2 : 3;
    const stage = choice === 'local' ? localStage : localStage === 2 ? 3 : 2;
    if (!resolvePath(path, stage)) return false;
  }
  return unmergedPaths().length === 0;
}

function attemptRebase(target: string, options: Options) {
  let result = git(['rebase', target]);
  let resolutions = 0;
  while (!result.ok) {
    const conflicts = unmergedPaths();
    const onlyLockfileConflicts = conflicts.every(isDependencyLockfile);
    if (!conflicts.length || (options.conflictStrategy === 'abort' && !onlyLockfileConflicts)) {
      return undefined;
    }
    console.warn(
      `Resolving ${conflicts.length} rebase conflict${conflicts.length === 1 ? '' : 's'} automatically...`
    );
    const strategy = options.conflictStrategy === 'abort' ? 'local' : options.conflictStrategy;
    if (!resolveConflicts(conflicts, strategy, 'rebase', options.skip)) return undefined;
    resolutions += conflicts.length;
    result = git(['-c', 'core.editor=true', 'rebase', '--continue'], false, {
      GIT_EDITOR: 'true',
      GIT_SEQUENCE_EDITOR: 'true',
    });
  }
  return resolutions;
}

function attemptMerge(target: string, options: Options) {
  const result = git(['merge', '--no-edit', target]);
  if (result.ok) return 0;
  const conflicts = unmergedPaths();
  const onlyLockfileConflicts = conflicts.every(isDependencyLockfile);
  if (!conflicts.length || (options.conflictStrategy === 'abort' && !onlyLockfileConflicts)) {
    return undefined;
  }
  console.warn(
    `Resolving ${conflicts.length} merge conflict${conflicts.length === 1 ? '' : 's'} automatically...`
  );
  const strategy = options.conflictStrategy === 'abort' ? 'local' : options.conflictStrategy;
  if (!resolveConflicts(conflicts, strategy, 'merge', options.skip)) return undefined;
  return git(['-c', 'core.editor=true', 'commit', '--no-edit'], false, { GIT_EDITOR: 'true' }).ok
    ? conflicts.length
    : undefined;
}

function trackedPathsAt(commit: string) {
  const result = git(['ls-tree', '-r', '--name-only', '-z', commit], true);
  if (!result.ok) throw new Error(`Could not inspect files at ${commit}.`);
  return result.stdout.split('\0').filter(Boolean);
}

function preserveSkippedFiles(originalHead: string, target: string, patterns: string[]) {
  if (!patterns.length) return [];
  const originalPaths = new Set(trackedPathsAt(originalHead));
  const candidates = new Set([...originalPaths, ...trackedPathsAt(target)]);
  const preserved = [...candidates].filter((path) => matchesSkipped(path, patterns)).sort();
  for (const path of preserved) {
    const result = originalPaths.has(path)
      ? git(['restore', '--source', originalHead, '--staged', '--worktree', '--', path], true)
      : git(['rm', '-f', '--ignore-unmatch', '--', path], true);
    if (!result.ok) throw new Error(`Could not preserve skipped file: ${path}`);
  }
  if (git(['diff', '--cached', '--quiet']).ok) return preserved;
  if (
    !git([
      '-c',
      'commit.gpgSign=false',
      'commit',
      '--no-verify',
      '-m',
      'chore(update): preserve skipped files',
    ]).ok
  ) {
    throw new Error('Could not commit the preserved skipped files.');
  }
  return preserved;
}

function restoreStash(stashOid: string | undefined, strategy: ConflictStrategy, skip: string[]) {
  if (!stashOid) return true;
  console.log('\nRestoring pre-update working tree changes...');
  const applied = git(['stash', 'apply', '--index', stashOid]);
  if (!applied.ok) {
    const conflicts = unmergedPaths();
    const onlyLockfileConflicts = conflicts.every(isDependencyLockfile);
    if (
      !conflicts.length ||
      (strategy === 'abort' && !onlyLockfileConflicts) ||
      !resolveConflicts(conflicts, 'local', 'stash', skip)
    ) {
      console.error(
        `Your changes remain saved in stash commit ${stashOid}. Resolve the working tree conflicts, then drop that stash manually.`
      );
      return false;
    }
    console.warn(
      `Resolved ${conflicts.length} stash conflict${conflicts.length === 1 ? '' : 's'} in favor of your pre-update changes.`
    );
  }
  const entries = gitOutput(['stash', 'list', '--format=%H %gd'])
    .split('\n')
    .map((line) => line.split(' '));
  const selector = entries.find(([oid]) => oid === stashOid)?.[1];
  if (selector && !git(['stash', 'drop', selector]).ok) {
    console.warn(`The update succeeded, but stash ${selector} could not be dropped.`);
  }
  return true;
}

function updateDependencies() {
  console.log('\nUpdating dependencies and regenerating the lockfile...');
  const activePackageManager = process.env.npm_execpath;
  if (activePackageManager && /(?:^|[\\/])pnpm(?:\.c?js)?$/i.test(activePackageManager)) {
    return (
      spawnSync(process.execPath, [activePackageManager, 'up'], { stdio: 'inherit' }).status === 0
    );
  }
  const executable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(executable, ['up'], {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });
  if (result.error) console.error(`Could not start pnpm: ${result.error.message}`);
  return result.status === 0;
}

function printDryRun(options: Options, branch: string) {
  console.log('Dry run only; no refs, files, or dependencies will be changed.');
  console.log(`Branch: ${branch}`);
  console.log(`Remote: ${options.remote} (${options.remoteUrl})`);
  console.log(`Target: ${options.remote}/${options.branch ?? '<default branch>'}`);
  console.log(`Conflict policy: ${options.conflictStrategy}`);
  console.log(`Skipped files: ${options.skip.length ? options.skip.join(', ') : '(none)'}`);
  console.log('Dependency update: pnpm up (always)');
  if (options.configFile) console.log(`Config: ${options.configFile}`);
}

function printHelp() {
  console.log(`Usage: pnpm starrybio:update -- [options]

Options:
  --branch <name>          Upstream branch (auto-detected by default)
  --remote <name>          Upstream remote name (default: ${DEFAULT_REMOTE})
  --remote-url <url>       URL used when adding the remote
  --conflicts <policy>     local, upstream, or abort (default: local)
  --skip <glob>            Preserve matching files; repeatable
  --no-default-skips       Do not preserve README.md automatically
  --config <path>          Read a specific updater JSON config
  --no-config              Ignore .starrybio-updater.json
  --dry-run                Print effective settings without changing anything
  --help, -h               Show this help`);
}

export function main(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  if (options.help) return printHelp();
  const currentBranch = assertRepositoryReady();
  if (options.dryRun) return printDryRun(options, currentBranch);

  if (!remoteExists(options.remote)) {
    console.log(`Adding ${options.remote} remote (${options.remoteUrl})...`);
    if (!git(['remote', 'add', options.remote, options.remoteUrl]).ok) {
      throw new Error(`Could not add remote "${options.remote}".`);
    }
  } else {
    const configuredUrl = gitOutput(['remote', 'get-url', options.remote]);
    if (configuredUrl !== options.remoteUrl) {
      console.warn(
        `Remote "${options.remote}" uses ${configuredUrl}; leaving it unchanged (configured default: ${options.remoteUrl}).`
      );
    }
  }

  console.log(`Fetching ${options.remote}...`);
  if (!git(['fetch', '--prune', options.remote]).ok)
    throw new Error(`Could not fetch ${options.remote}.`);
  const remoteBranch = resolveRemoteBranch(options.remote, options.branch);
  const target = `${options.remote}/${remoteBranch}`;
  if (!git(['show-ref', '--verify', '--quiet', `refs/remotes/${target}`], true).ok) {
    throw new Error(`Remote branch ${target} does not exist.`);
  }

  const originalHead = gitOutput(['rev-parse', 'HEAD']);
  const backupRef = createBackupRef(originalHead);
  const stashOid = stashChanges();
  let integrationComplete = false;
  console.log(`Recovery point: ${backupRef}`);
  console.log(`Updating ${currentBranch} from ${target}...`);

  try {
    let conflictCount = attemptRebase(target, options);
    let method = 'rebase';
    if (conflictCount === undefined) {
      console.warn('Rebase did not complete; restoring the branch before trying a merge.');
      abortInProgress();
      if (!git(['reset', '--hard', originalHead]).ok)
        throw new Error('Could not reset after rebase.');
      conflictCount = attemptMerge(target, options);
      method = 'merge';
    }
    if (conflictCount === undefined)
      throw new Error('All configured integration strategies failed.');

    const preserved = preserveSkippedFiles(originalHead, target, options.skip);
    integrationComplete = true;
    const stashRestored = restoreStash(stashOid, options.conflictStrategy, options.skip);
    const dependenciesUpdated = updateDependencies();

    console.log(`\nRepository updated from ${target} using ${method}.`);
    if (conflictCount)
      console.log(`Automatically resolved ${conflictCount} integration conflicts.`);
    if (preserved.length) console.log(`Preserved ${preserved.length} skipped file(s).`);
    console.log(`Recovery point retained at ${backupRef}.`);
    if (!stashRestored) {
      process.exitCode = 2;
    }
    if (!dependenciesUpdated) {
      console.error(
        'The Git update succeeded, but the dependency update failed. Run pnpm up after fixing the reported error.'
      );
      if (!process.exitCode) process.exitCode = 3;
    }
  } catch (error) {
    if (!integrationComplete) {
      console.error('\nUpdate integration failed; restoring the starting commit.');
      abortInProgress();
      if (!git(['reset', '--hard', originalHead]).ok) {
        throw new Error(
          `Automatic restoration failed. Recover with: git reset --hard ${backupRef}`,
          { cause: error }
        );
      }
      restoreStash(stashOid, 'local', options.skip);
    }
    throw new Error(
      `${error instanceof Error ? error.message : String(error)} The original commit is available at ${backupRef}.`,
      { cause: error }
    );
  }
}

const entryPoint = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === entryPoint) {
  try {
    main();
  } catch (error) {
    console.error(`\nUpdate failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
