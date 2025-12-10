import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'stVaults CLI tests',
    environment: 'node',
    include: ['tests/utils/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/integration/**'],
    globals: true,
    testTimeout: 30000,
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
