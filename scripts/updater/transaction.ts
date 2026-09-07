import { cp, lstat, mkdir, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { assertNoSymlinkAncestors, resolveInside } from './filesystem';
import { type UpdaterPaths, writeJsonAtomic } from './state';

interface JournalEntry {
  hadOriginal: boolean;
  path: string;
}

interface Journal {
  backupDirectory: string;
  entries: JournalEntry[];
  schemaVersion: 1;
  transactionId: string;
}

async function exists(file: string): Promise<boolean> {
  try {
    await lstat(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

async function move(source: string, destination: string): Promise<void> {
  await mkdir(path.dirname(destination), { recursive: true });
  await rename(source, destination);
}

export async function recoverInterruptedTransaction(paths: UpdaterPaths): Promise<boolean> {
  let journal: Journal;
  try {
    journal = JSON.parse(await readFile(paths.journal, 'utf8')) as Journal;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw new Error('The updater transaction journal is unreadable; refusing unsafe recovery.', {
      cause: error,
    });
  }
  if (journal.schemaVersion !== 1 || !Array.isArray(journal.entries)) {
    throw new Error('The updater transaction journal has an unsupported schema.');
  }
  if (!/^[a-z0-9-]{1,64}$/i.test(journal.transactionId)) {
    throw new Error('The updater transaction journal has an unsafe transaction ID.');
  }
  const expectedBackupDirectory = path.join(paths.work, journal.transactionId, 'backup');
  if (path.resolve(journal.backupDirectory) !== path.resolve(expectedBackupDirectory)) {
    throw new Error('The updater transaction journal points outside its transaction workspace.');
  }
  for (const entry of [...journal.entries].reverse()) {
    await assertNoSymlinkAncestors(paths.root, entry.path);
    const live = resolveInside(paths.root, entry.path);
    const backup = resolveInside(journal.backupDirectory, entry.path);
    await rm(live, { force: true, recursive: true });
    if (entry.hadOriginal && (await exists(backup))) await move(backup, live);
  }
  await rm(paths.journal, { force: true });
  await rm(path.join(paths.work, journal.transactionId), { force: true, recursive: true });
  return true;
}

export async function commitStaging(options: {
  affectedPaths: string[];
  paths: UpdaterPaths;
  stagingRoot: string;
  transactionId: string;
}): Promise<void> {
  const backupDirectory = path.join(options.paths.work, options.transactionId, 'backup');
  await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  const journal: Journal = {
    backupDirectory,
    entries: [],
    schemaVersion: 1,
    transactionId: options.transactionId,
  };
  await writeJsonAtomic(options.paths.journal, journal);
  try {
    const orderedPaths = [...new Set(options.affectedPaths)].sort((left, right) => {
      const priority = (value: string) =>
        value === '.starrybio/updater-state.json' ? 2 : value === '.starrybio/baseline' ? 1 : 0;
      return priority(left) - priority(right) || left.localeCompare(right);
    });
    for (const relative of orderedPaths) {
      await assertNoSymlinkAncestors(options.paths.root, relative);
      const live = resolveInside(options.paths.root, relative);
      const staged = resolveInside(options.stagingRoot, relative);
      const backup = resolveInside(backupDirectory, relative);
      const hadOriginal = await exists(live);
      journal.entries.push({ hadOriginal, path: relative });
      await writeJsonAtomic(options.paths.journal, journal);
      if (hadOriginal) await move(live, backup);
      if (await exists(staged)) {
        await mkdir(path.dirname(live), { recursive: true });
        try {
          await rename(staged, live);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error;
          await cp(staged, live, { recursive: true, errorOnExist: true, preserveTimestamps: true });
          await rm(staged, { force: true, recursive: true });
        }
      }
    }
  } catch (error) {
    await recoverInterruptedTransaction(options.paths);
    throw new Error(
      'Update commit failed; rollback completed and the live installation was restored.',
      {
        cause: error,
      }
    );
  }
}

export async function finishTransaction(paths: UpdaterPaths, transactionId: string): Promise<void> {
  const backupDirectory = path.join(paths.work, transactionId, 'backup');
  await rm(paths.journal, { force: true });
  await rm(backupDirectory, { force: true, recursive: true });
}
