import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const DEFAULT_REMOTE = 'starrybio';
const DEFAULT_REMOTE_URL = 'https://github.com/nota9x/StarryBio.git';

type Options = {
  branch?: string;
  dryRun: boolean;
  install: boolean;
  remote: string;
  remoteUrl: string;
};

type Attempt = {
  command: string[];
  label: string;
  warning?: string;
};

function parseArgs(args: string[]): Options {
  const options: Options = {
    dryRun: false,
    install: true,
    remote: DEFAULT_REMOTE,
    remoteUrl: DEFAULT_REMOTE_URL,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const nextArgument = args[index + 1];
    const value = nextArgument && !nextArgument.startsWith('--') ? nextArgument : undefined;

    if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--no-install') options.install = false;
    else if (argument === '--remote' && value) {
      options.remote = value;
      index += 1;
    } else if (argument === '--remote-url' && value) {
      options.remoteUrl = value;
      index += 1;
    } else if (argument === '--branch' && value) {
      options.branch = value;
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  return options;
}

function git(args: string[], capture = false) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
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
  if (!result.ok) {
    throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  }
  return result.stdout;
}

function hasGitDirEntry(name: string) {
  const path = git(['rev-parse', '--git-path', name], true);
  if (!path.ok) return false;
  return existsSync(path.stdout);
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
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const ref = `refs/starrybio-update-backups/${timestamp}`;
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

function restoreStash(stashOid?: string) {
  if (!stashOid) return true;

  console.log('\nRestoring pre-update working tree changes...');
  if (!git(['stash', 'apply', '--index', stashOid]).ok) {
    console.error(
      `Your changes remain saved in stash commit ${stashOid}. Resolve the working tree conflicts, then drop that stash manually.`
    );
    return false;
  }

  const entries = gitOutput(['stash', 'list', '--format=%H %gd'])
    .split('\n')
    .map((line) => line.split(' '));
  const selector = entries.find(([oid]) => oid === stashOid)?.[1];
  if (selector) git(['stash', 'drop', selector]);
  return true;
}

function installDependencies() {
  console.log('\nInstalling the locked dependency graph...');
  const executable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(executable, ['install', '--frozen-lockfile'], {
    stdio: 'inherit',
  });
  return result.status === 0;
}

function printDryRun(options: Options, branch: string) {
  console.log('Dry run only; no refs, files, or dependencies will be changed.');
  console.log(`1. Ensure remote "${options.remote}" points to ${options.remoteUrl}`);
  console.log(`2. Fetch and prune "${options.remote}"`);
  console.log(`3. Back up branch "${branch}" and stash local changes`);
  console.log(
    `4. Try rebase, merge, then local-change-preserving rebase against ${options.remote}/${options.branch ?? '<default branch>'}`
  );
  console.log(
    `5. Restore the stash${options.install ? ' and run pnpm install --frozen-lockfile' : ''}`
  );
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const currentBranch = assertRepositoryReady();

  if (options.dryRun) {
    printDryRun(options, currentBranch);
    return;
  }

  if (!remoteExists(options.remote)) {
    console.log(`Adding ${options.remote} remote (${options.remoteUrl})...`);
    if (!git(['remote', 'add', options.remote, options.remoteUrl]).ok) {
      throw new Error(`Could not add remote "${options.remote}".`);
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

  console.log(`Recovery point: ${backupRef}`);
  console.log(`Updating ${currentBranch} from ${target}...`);

  const attempts: Attempt[] = [
    { label: 'clean rebase', command: ['rebase', target] },
    { label: 'merge fallback', command: ['merge', '--no-edit', target] },
    {
      label: 'local-change-preserving rebase',
      command: ['rebase', '--strategy=ort', '--strategy-option=theirs', target],
      warning:
        'Conflicting hunks were resolved in favor of local commits. Review the result carefully.',
    },
  ];

  let completed: Attempt | undefined;
  for (const attempt of attempts) {
    console.log(`\nTrying ${attempt.label}...`);
    if (git(attempt.command).ok) {
      completed = attempt;
      break;
    }
    console.warn(`${attempt.label} did not complete; aborting it cleanly.`);
    abortInProgress();
  }

  if (!completed) {
    console.error('\nAll automatic integration strategies failed. Restoring the starting commit.');
    abortInProgress();
    if (!git(['reset', '--hard', originalHead]).ok) {
      throw new Error(`Automatic restoration failed. Recover with: git reset --hard ${backupRef}`);
    }
    restoreStash(stashOid);
    throw new Error(
      `Update stopped safely. The original commit is also available at ${backupRef}.`
    );
  }

  if (completed.warning) console.warn(`\nWarning: ${completed.warning}`);
  const stashRestored = restoreStash(stashOid);
  const dependenciesInstalled = !options.install || !stashRestored || installDependencies();

  console.log(`\nRepository updated from ${target} using ${completed.label}.`);
  console.log(`Recovery point retained at ${backupRef}.`);

  if (!stashRestored) {
    if (options.install)
      console.error(
        'Dependency installation was skipped until the working tree conflicts are resolved.'
      );
    process.exitCode = 2;
  }
  if (!dependenciesInstalled) {
    console.error(
      'The Git update succeeded, but dependency installation failed. Run pnpm install --frozen-lockfile after fixing the reported error.'
    );
    process.exitCode = 3;
  }
}

try {
  main();
} catch (error) {
  console.error(`\nUpdate failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
