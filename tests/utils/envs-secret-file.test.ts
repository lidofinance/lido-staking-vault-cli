import { afterEach, describe, expect, test, vi } from 'vitest';

const mockParsed: { current: Record<string, string> } = { current: {} };

vi.mock('dotenv', () => ({
  config: () => ({ parsed: mockParsed.current }),
}));

const loadEnvs = async () => {
  vi.resetModules();
  const { envs } = await import('../../configs/envs.js');
  return envs;
};

describe('configs/envs *_FILE variables', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mockParsed.current = {};
  });

  test('reads *_FILE from process environment', async () => {
    vi.stubEnv('PRIVATE_KEY_FILE', '/run/secrets/key');
    vi.stubEnv('ACCOUNT_FILE_PASSWORD_FILE', '/run/secrets/password');

    const envs = await loadEnvs();
    expect(envs?.PRIVATE_KEY_FILE).toBe('/run/secrets/key');
    expect(envs?.ACCOUNT_FILE_PASSWORD_FILE).toBe('/run/secrets/password');
  });

  test('reads *_FILE from .env', async () => {
    mockParsed.current = {
      PRIVATE_KEY_FILE: '/env/key',
      ACCOUNT_FILE_PASSWORD_FILE: '/env/password',
    };

    const envs = await loadEnvs();
    expect(envs?.PRIVATE_KEY_FILE).toBe('/env/key');
    expect(envs?.ACCOUNT_FILE_PASSWORD_FILE).toBe('/env/password');
  });

  test('process environment takes precedence over .env', async () => {
    mockParsed.current = {
      PRIVATE_KEY_FILE: '/env/key',
      ACCOUNT_FILE_PASSWORD_FILE: '/env/password',
    };
    vi.stubEnv('PRIVATE_KEY_FILE', '/run/secrets/key');
    vi.stubEnv('ACCOUNT_FILE_PASSWORD_FILE', '/run/secrets/password');

    const envs = await loadEnvs();
    expect(envs?.PRIVATE_KEY_FILE).toBe('/run/secrets/key');
    expect(envs?.ACCOUNT_FILE_PASSWORD_FILE).toBe('/run/secrets/password');
  });
});
