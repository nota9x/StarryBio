import { pathToFileURL } from 'node:url';
import { runUpdater, type UpdateResult } from './updater/core';

interface CliOptions {
  check: boolean;
  dryRun: boolean;
  help: boolean;
  yes: boolean;
}

const HELP = `Usage: pnpm starrybio:update [options]

Checks for a newer StarryBio release and updates this installation while preserving local changes.

Options:
  --check     Check whether an update is available
  --dry-run   Verify, merge, install dependencies, and build entirely in staging
  --yes       Confirm installation non-interactively
  --help      Show this help
`;

export function parseArguments(arguments_: string[]): CliOptions {
  const options: CliOptions = { check: false, dryRun: false, help: false, yes: false };
  for (const argument of arguments_) {
    if (argument === '--check') options.check = true;
    else if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--yes') options.yes = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new Error(`Unknown option: ${argument}\n\n${HELP}`);
  }
  if (options.check && options.dryRun) throw new Error('--check and --dry-run cannot be combined.');
  return options;
}

function operationCount(result: UpdateResult): number {
  return (
    result.stats.added.length +
    result.stats.updated.length +
    result.stats.removed.length +
    result.stats.renamed.length
  );
}

function printResult(result: UpdateResult, options: CliOptions): void {
  console.log(`Current version: ${result.currentVersion}`);
  if (!result.availableVersion) {
    console.log('No newer stable GitHub Release is available.');
    return;
  }
  console.log(`Available release: ${result.availableVersion}`);
  if (options.check) return;
  console.log(
    `Plan: ${result.stats.added.length} added, ${result.stats.updated.length} updated, ` +
      `${result.stats.removed.length} removed, ${result.stats.merged.length} automatically merged.`
  );
  if (result.stats.configAdded.length || result.stats.configRemoved.length) {
    console.log(
      `Config migration: ${result.stats.configAdded.length} added, ${result.stats.configRemoved.length} removed.`
    );
  }
  if (result.rollbackCompleted)
    console.log('Recovered and rolled back an interrupted prior update.');
  if (options.dryRun) console.log('Dry run complete; the live installation was not changed.');
  else if (result.updated) {
    console.log(`Updated successfully (${operationCount(result)} upstream file operations).`);
  } else console.log('Update was not installed.');
}

export async function main(arguments_ = process.argv.slice(2)): Promise<void> {
  const options = parseArguments(arguments_);
  if (options.help) {
    console.log(HELP);
    return;
  }
  const result = await runUpdater(options);
  printResult(result, options);
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  main().catch((error: unknown) => {
    console.error(`Update failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
