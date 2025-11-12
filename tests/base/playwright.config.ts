import type { PlaywrightTestConfig } from '@playwright/test';

export const pwConfig: PlaywrightTestConfig = {
  timeout: 180 * 1000,
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // eslint-disable-next-line sonarjs/no-all-duplicated-branches
  workers: process.env.CI ? 1 : 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    actionTimeout: 15000,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'lsv_cli_tests',
      dependencies: ['setup lsv_cli before all'],
      timeout: 220 * 1000,
    },
    {
      name: 'setup lsv_cli before all',
      testMatch: /globalSetup\.ts/,
      timeout: 350 * 1000, // for Setup project we have to increase timeout
    },
  ],
};

export default pwConfig;
