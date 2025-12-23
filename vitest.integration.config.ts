import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'stVaults CLI integration tests',
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globalSetup: ['./tests/integration/globalSetup.ts'],
    globals: true,
    testTimeout: 120000,
    hookTimeout: 60000,
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
    coverage: {
      include: ['features/**/*.ts'],
      exclude: ['features/**/*.test.ts', 'utils/proof/**/*.ts'],
    },
    env: {
      NODE_ENV: 'test',
      VITEST: 'true',
    },
  },
  resolve: {
    alias: {
      abi: path.resolve(__dirname, './abi'),
      command: path.resolve(__dirname, './command'),
      utils: path.resolve(__dirname, './utils'),
      configs: path.resolve(__dirname, './configs'),
      version: path.resolve(__dirname, './version'),
      contracts: path.resolve(__dirname, './contracts'),
      features: path.resolve(__dirname, './features'),
      providers: path.resolve(__dirname, './providers'),
    },
  },
});
