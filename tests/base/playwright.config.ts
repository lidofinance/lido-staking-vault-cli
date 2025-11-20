import type { PlaywrightTestConfig } from '@playwright/test';
import { getReportConfig } from './config/report.config';

export const pwConfig: PlaywrightTestConfig = {
  timeout: 180 * 1000,
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: getReportConfig(),
  use: {
    actionTimeout: 15 * 1000,
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
