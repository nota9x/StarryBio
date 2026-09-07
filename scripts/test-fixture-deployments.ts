import { createDeploymentProject, runPnpm } from '../tests/helpers/deployment-project';

for (const fixture of ['minimal.config.ts', 'customized.config.ts'] as const) {
  console.log(`\n=== Browser checks: ${fixture} ===`);
  const deployment = await createDeploymentProject(fixture);
  try {
    await runPnpm(deployment.project, ['headers'], deployment.environment, 'inherit');
    await runPnpm(deployment.project, ['build'], deployment.environment, 'inherit');
    await runPnpm(
      deployment.project,
      ['exec', 'playwright', 'test'],
      deployment.environment,
      'inherit'
    );
  } finally {
    await deployment.cleanup();
  }
}
