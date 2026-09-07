import { lstat, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { buildDeploymentProject, createDeploymentProject } from '../helpers/deployment-project';

const cleanupTasks: Array<() => Promise<void>> = [];

afterAll(async () => {
  await Promise.all(cleanupTasks.splice(0).map((cleanup) => cleanup()));
});

async function buildFixture(
  fixture: 'minimal.config.ts' | 'customized.config.ts',
  environment: NodeJS.ProcessEnv = {}
): Promise<string> {
  const deployment = await createDeploymentProject(fixture, environment);
  cleanupTasks.push(() => deployment.cleanup());
  await buildDeploymentProject(deployment);
  return deployment.project;
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

describe('representative downstream production builds', () => {
  test('builds a minimal config without empty optional-feature markup', async () => {
    const project = await buildFixture('minimal.config.ts');
    const html = await readFile(path.join(project, 'dist', 'index.html'), 'utf8');

    expect(html).toContain('River Example');
    expect(html).not.toContain('status-indicator-container');
    expect(html).not.toContain('announcement-banner-container');
    expect(html).not.toContain('profile-actions');
    expect(html).not.toContain('stars-container');
    expect(html).not.toContain('starrybio-analytics');
    expect(await exists(path.join(project, 'dist', 'qr.png'))).toBe(false);
    expect(await exists(path.join(project, 'dist', 'contact.vcf'))).toBe(false);
  });

  test('builds a heavily customized config with custom URLs, base paths, and generated outputs', async () => {
    const project = await buildFixture('customized.config.ts', {
      STARRYBIO_BASE_PATH: '/people/ada/',
      STARRYBIO_SITE_URL: 'https://profiles.example.test',
    });
    const html = await readFile(path.join(project, 'dist', 'index.html'), 'utf8');

    expect(html).toContain('Ada Orbit');
    expect(html).toContain('ORBIT-73');
    expect(html).toContain('Transmitting live');
    expect(html).toContain('/people/ada/generated/share/ada-qr.svg');
    expect(html).toContain('/people/ada/generated/contact/ada.vcf');
    expect(html).not.toContain('starfield-canvas');
    await expect(
      stat(path.join(project, 'dist', 'generated', 'share', 'ada-qr.svg'))
    ).resolves.toBeDefined();
    await expect(
      stat(path.join(project, 'dist', 'generated', 'social', 'ada-card.svg'))
    ).resolves.toBeDefined();
    const card = await readFile(
      path.join(project, 'dist', 'generated', 'contact', 'ada.vcf'),
      'utf8'
    );
    expect(card).toContain('FN:Ada Orbit');
  });
});
