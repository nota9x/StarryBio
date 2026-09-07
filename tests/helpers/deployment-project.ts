import { spawn } from 'node:child_process';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '../..');

export interface DeploymentProject {
  cleanup(): Promise<void>;
  environment: NodeJS.ProcessEnv;
  project: string;
}

export async function createDeploymentProject(
  fixture: 'minimal.config.ts' | 'customized.config.ts',
  environment: NodeJS.ProcessEnv = {}
): Promise<DeploymentProject> {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'starrybio-deployment-'));
  const project = path.join(temporaryRoot, 'site');
  const excluded = new Set([
    '.git',
    '.astro',
    'dist',
    'node_modules',
    'playwright-report',
    'test-results',
  ]);
  const deploymentEnvironment = {
    ...environment,
    STARRYBIO_CONFIG_PATH: path.join(project, 'tests', 'fixtures', fixture),
  };
  try {
    await cp(projectRoot, project, {
      recursive: true,
      filter(source) {
        const relative = path.relative(projectRoot, source);
        return relative === '' || !excluded.has(relative.split(path.sep)[0]);
      },
    });
    await runPnpm(project, ['install', '--offline', '--frozen-lockfile'], deploymentEnvironment);
    return {
      cleanup: () => rm(temporaryRoot, { force: true, recursive: true }),
      environment: deploymentEnvironment,
      project,
    };
  } catch (error) {
    await rm(temporaryRoot, { force: true, recursive: true });
    throw error;
  }
}

export async function runPnpm(
  project: string,
  args: string[],
  environment: NodeJS.ProcessEnv,
  output: 'capture' | 'inherit' = 'capture'
): Promise<void> {
  const executable = process.platform === 'win32' ? 'cmd.exe' : 'pnpm';
  const commandArguments =
    process.platform === 'win32' ? ['/d', '/s', '/c', 'pnpm.cmd', ...args] : args;
  await new Promise<void>((resolve, reject) => {
    const child = spawn(executable, commandArguments, {
      cwd: project,
      env: { ...process.env, ...environment },
      stdio: output === 'inherit' ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    });
    let captured = '';
    child.stdout?.on('data', (chunk: Buffer) => (captured += chunk.toString()));
    child.stderr?.on('data', (chunk: Buffer) => (captured += chunk.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm ${args.join(' ')} failed with code ${code}:\n${captured}`));
    });
  });
}

export async function buildDeploymentProject(deployment: DeploymentProject): Promise<void> {
  await runPnpm(deployment.project, ['headers'], deployment.environment);
  await runPnpm(deployment.project, ['build'], deployment.environment);
}
