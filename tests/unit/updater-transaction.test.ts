import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { updaterPaths } from '../../scripts/updater/state';
import { commitStaging, recoverInterruptedTransaction } from '../../scripts/updater/transaction';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((item) => rm(item, { force: true, recursive: true }))
  );
});

describe('transaction recovery', () => {
  it('rolls back an interrupted replacement from its durable journal', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'starrybio-transaction-'));
    temporaryDirectories.push(root);
    const paths = updaterPaths(root);
    const backup = path.join(paths.work, 'tx', 'backup');
    await mkdir(path.join(backup, 'config'), { recursive: true });
    await mkdir(path.join(root, 'config'), { recursive: true });
    await writeFile(path.join(root, 'config', 'site.txt'), 'partially installed');
    await writeFile(path.join(backup, 'config', 'site.txt'), 'original');
    await mkdir(paths.metadata, { recursive: true });
    await writeFile(
      paths.journal,
      JSON.stringify({
        backupDirectory: backup,
        entries: [{ hadOriginal: true, path: 'config/site.txt' }],
        schemaVersion: 1,
        transactionId: 'tx',
      })
    );
    expect(await recoverInterruptedTransaction(paths)).toBe(true);
    expect(await readFile(path.join(root, 'config', 'site.txt'), 'utf8')).toBe('original');
    expect(await recoverInterruptedTransaction(paths)).toBe(false);
  });

  it('automatically restores earlier paths when a later commit phase fails', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'starrybio-transaction-'));
    temporaryDirectories.push(root);
    const staging = path.join(root, 'staging-outside');
    const installation = path.join(root, 'installation');
    await mkdir(staging, { recursive: true });
    await mkdir(installation, { recursive: true });
    await writeFile(path.join(installation, 'a.txt'), 'original');
    await writeFile(path.join(staging, 'a.txt'), 'replacement');
    await writeFile(path.join(installation, 'blocked'), 'not a directory');
    await mkdir(path.join(staging, 'blocked'), { recursive: true });
    await writeFile(path.join(staging, 'blocked', 'child.txt'), 'incoming');
    const paths = updaterPaths(installation);
    await expect(
      commitStaging({
        affectedPaths: ['a.txt', 'blocked/child.txt'],
        paths,
        stagingRoot: staging,
        transactionId: 'injected-failure',
      })
    ).rejects.toThrow('rollback completed');
    expect(await readFile(path.join(installation, 'a.txt'), 'utf8')).toBe('original');
    expect(await readFile(path.join(installation, 'blocked'), 'utf8')).toBe('not a directory');
  });
});
