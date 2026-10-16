import { ReporterDescription } from '@playwright/test';

const htmlReporter: ReporterDescription = [
  'html',
  { outputFolder: 'playwright-report', open: 'never' },
];
const consoleReporter: ReporterDescription = [
  'list',
  { printSteps: !process.env.CI },
];
const githubReporter: ReporterDescription = ['github'];

export const getReportConfig: () => ReporterDescription[] = function () {
  const reporterConfig: ReporterDescription[] = [htmlReporter, consoleReporter];
  if (process.env.CI) {
    reporterConfig.push(githubReporter);
  }
  return reporterConfig;
};
