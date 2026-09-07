import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { extractAndValidateArchive } from './updater/archive';

const archive = process.argv[2];
if (!archive) throw new Error('Usage: tsx scripts/verify-update-artifact.ts <archive>');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'starrybio-artifact-'));
try {
  const result = await extractAndValidateArchive(path.resolve(archive), temporary);
  console.log(
    `Verified ${result.manifest.tag}: ${result.manifest.files.length} files, ${result.manifest.renames.length} renames.`
  );
} finally {
  await rm(temporary, { force: true, recursive: true });
}
