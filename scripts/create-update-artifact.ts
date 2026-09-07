import { execFileSync } from 'node:child_process';
import { lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as tar from 'tar';
import { isForbiddenManagedImage, normalizeManifestPath, sha256 } from './updater/filesystem';
import { PROJECT_ID, UPDATE_MANIFEST_SCHEMA, type UpdateManifest } from './updater/types';

interface ArtifactArguments {
  commit: string;
  outputDirectory: string;
  previousTag?: string;
  tag: string;
}

function git(arguments_: string[]): string {
  return execFileSync('git', arguments_, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();
}

function parseArguments(arguments_: string[]): ArtifactArguments {
  const result: Partial<ArtifactArguments> = {};
  for (let index = 0; index < arguments_.length; index += 2) {
    const key = arguments_[index];
    const value = arguments_[index + 1];
    if (!value) throw new Error(`Missing value for ${key}.`);
    if (key === '--tag') result.tag = value;
    else if (key === '--commit') result.commit = value;
    else if (key === '--previous-tag') result.previousTag = value;
    else if (key === '--output') result.outputDirectory = value;
    else throw new Error(`Unknown option: ${key}`);
  }
  result.tag ??= process.env.GITHUB_REF_NAME;
  result.commit ??= process.env.GITHUB_SHA;
  result.outputDirectory ??= 'release-artifacts';
  if (!result.tag || !result.commit) throw new Error('--tag and --commit are required.');
  return result as ArtifactArguments;
}

function trackedFiles(): Array<{ mode: number; path: string }> {
  return git(['ls-files', '-s'])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const match = /^(\d{6}) [a-f0-9]+ \d+\t(.+)$/.exec(line);
      if (!match) throw new Error(`Cannot parse tracked file: ${line}`);
      const relative = normalizeManifestPath(match[2]);
      if (match[1] === '120000')
        throw new Error(`Release payload cannot contain a symlink: ${relative}`);
      if (match[1] !== '100644' && match[1] !== '100755') {
        throw new Error(`Release payload contains an unsupported file mode: ${relative}`);
      }
      if (isForbiddenManagedImage(relative)) {
        throw new Error(`Move shipped images into public/assets/images/default/: ${relative}`);
      }
      return { mode: Number.parseInt(match[1].slice(-3), 8), path: relative };
    });
}

function renameMetadata(previousTag: string | undefined, tag: string): UpdateManifest['renames'] {
  if (!previousTag) return [];
  return git(['diff', '--name-status', '--find-renames=50%', `${previousTag}..${tag}`])
    .split(/\r?\n/)
    .filter((line) => line.startsWith('R'))
    .map((line) => {
      const [, from, to] = line.split('\t');
      return { from: normalizeManifestPath(from), to: normalizeManifestPath(to) };
    });
}

export async function createUpdateArtifact(arguments_ = process.argv.slice(2)): Promise<string> {
  const options = parseArguments(arguments_);
  const root = process.cwd();
  if (git(['status', '--porcelain'])) {
    throw new Error('Release payloads must be built from a clean checkout of the exact tag.');
  }
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as {
    version: string;
  };
  if (options.tag !== `v${packageJson.version}`) {
    throw new Error(`Tag ${options.tag} does not match package version ${packageJson.version}.`);
  }
  const resolvedCommit = git(['rev-parse', `${options.tag}^{commit}`]).toLowerCase();
  if (resolvedCommit !== options.commit.toLowerCase()) {
    throw new Error(`Tag ${options.tag} does not resolve to requested commit ${options.commit}.`);
  }
  const files = trackedFiles();
  const folded = new Set<string>();
  const outputDirectory = path.resolve(root, options.outputDirectory);
  const outputRelation = path.relative(root, outputDirectory);
  if (!outputRelation || outputRelation === '..' || outputRelation.startsWith(`..${path.sep}`)) {
    throw new Error('Release output directory must be a child of the repository root.');
  }
  const assembly = path.join(outputDirectory, '.assembly');
  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(path.join(assembly, 'payload'), { recursive: true, mode: 0o700 });
  const manifestFiles: UpdateManifest['files'] = [];
  for (const file of files.sort((left, right) => left.path.localeCompare(right.path))) {
    const key = file.path.normalize('NFC').toLocaleLowerCase('en-US');
    if (folded.has(key))
      throw new Error(`Tracked paths collide on case-insensitive filesystems: ${file.path}`);
    folded.add(key);
    const source = path.join(root, ...file.path.split('/'));
    const info = await lstat(source);
    if (!info.isFile() || info.isSymbolicLink() || info.nlink > 1) {
      throw new Error(`Release payload requires an independent regular file: ${file.path}`);
    }
    const contents = await readFile(source);
    const destination = path.join(assembly, 'payload', ...file.path.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, contents, { mode: file.mode });
    manifestFiles.push({
      mode: file.mode,
      path: file.path,
      sha256: sha256(contents),
      size: contents.length,
    });
  }
  const manifest: UpdateManifest = {
    commit: resolvedCommit,
    files: manifestFiles,
    generatedAt: git(['show', '-s', '--format=%cI', resolvedCommit]),
    project: PROJECT_ID,
    renames: renameMetadata(options.previousTag, options.tag),
    schemaVersion: UPDATE_MANIFEST_SCHEMA,
    tag: options.tag,
    version: packageJson.version,
  };
  await writeFile(path.join(assembly, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const archive = path.join(outputDirectory, `starrybio-update-${options.tag}.tgz`);
  await tar.create(
    {
      cwd: assembly,
      file: archive,
      gzip: true,
      noDirRecurse: true,
      portable: true,
      noMtime: true,
      prefix: '',
    },
    ['manifest.json', 'payload', ...manifestFiles.map((file) => `payload/${file.path}`)]
  );
  await rm(assembly, { force: true, recursive: true });
  console.log(archive);
  return archive;
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  createUpdateArtifact().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
