import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:8791',
    colorScheme: 'dark',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command:
      'wrangler dev --local --port 8791 --ip 127.0.0.1 --show-interactive-dev-session=false',
    url: 'http://127.0.0.1:8791',
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'ignore',
    gracefulShutdown: {
      signal: 'SIGTERM',
      timeout: 5_000,
    },
    timeout: 120_000,
  },
});
