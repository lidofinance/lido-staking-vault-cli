import { describe, test, expect, vi, beforeEach } from 'vitest';

const mockEnvs = vi.hoisted(() => {
  return {} as Record<string, string | undefined>;
});

// Mock envs to control DEPLOYED value
vi.mock('../../configs/envs.js', () => ({
  envs: new Proxy(mockEnvs, {
    get: (_target, prop) => mockEnvs[prop as string],
  }),
}));

// Mock fs calls so we don't hit actual filesystem
vi.mock('node:fs', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    lstatSync: vi.fn(() => ({ isFile: () => true })),
    readFileSync: vi.fn(() => '{"networkId": 1}'),
  };
});

import { importDeployFile } from '../../configs/deployed.js';

beforeEach(() => {
  vi.clearAllMocks();
  // Clear all keys from mockEnvs
  for (const key of Object.keys(mockEnvs)) {
    delete mockEnvs[key];
  }
});

describe('path traversal prevention (H4)', () => {
  test('rejects path traversal with ../', () => {
    mockEnvs.DEPLOYED = '../../etc/passwd';
    expect(() => importDeployFile()).toThrow('Path traversal detected');
  });

  test('rejects path traversal with absolute path escape', () => {
    mockEnvs.DEPLOYED = '../../../etc/shadow';
    expect(() => importDeployFile()).toThrow('Path traversal detected');
  });

  test('allows valid filename in configs dir', () => {
    mockEnvs.DEPLOYED = 'deployed-hoodi-vaults.json';
    const result = importDeployFile();
    expect(result).toEqual({ networkId: 1 });
  });

  test('allows subdirectory within configs', () => {
    mockEnvs.DEPLOYED = 'subdir/deployed.json';
    const result = importDeployFile();
    expect(result).toEqual({ networkId: 1 });
  });

  test('throws when DEPLOYED is not set', () => {
    expect(() => importDeployFile()).toThrow(
      'Deployed contracts file is not set',
    );
  });
});
