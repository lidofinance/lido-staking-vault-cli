import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Keystore } from 'ox';
import { privateKeyToAccount } from 'viem/accounts';

import type { Config } from '../../types/config.js';

// Anvil account #0
const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const ADDRESS = privateKeyToAccount(PRIVATE_KEY).address;
const PASSWORD = 'hunter2';

const mockConfig: { current: Partial<Config> } = { current: {} };
const mockEnvs: Record<string, string | undefined> = {};

vi.mock('command', () => ({
  program: { opts: () => ({}) },
}));

vi.mock('../../configs/index.js', () => ({
  getConfig: () => mockConfig.current,
  getChainId: async () => 560_048,
  getElUrl: () => 'http://localhost:8545',
  getChain: async () => ({ id: 560_048 }),
  envs: mockEnvs,
}));

vi.mock('../../utils/index.js', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, createWalletConnectClient: vi.fn() };
});

const { getAccount } = await import('../../providers/wallet.js');

describe('getAccount with *_FILE secrets', () => {
  let dir: string;

  const writeSecret = (name: string, content: string) => {
    const filePath = path.join(dir, name);
    writeFileSync(filePath, content);
    chmodSync(filePath, 0o600);
    return filePath;
  };

  // Low scrypt cost keeps the test fast
  const writeKeystore = () => {
    const [key, opts] = Keystore.scrypt({ password: PASSWORD, n: 1024 });
    const keystore = Keystore.encrypt(PRIVATE_KEY, key, opts);
    return writeSecret('account.json', JSON.stringify(keystore));
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'wallet-secret-file-'));
    mockConfig.current = {};
    for (const key of Object.keys(mockEnvs)) delete mockEnvs[key];
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  describe('PRIVATE_KEY_FILE', () => {
    test('signs with key read from file', async () => {
      mockConfig.current = {
        PRIVATE_KEY_FILE: writeSecret('key', `${PRIVATE_KEY}\n`),
      };

      const account = await getAccount();
      expect(account.address).toBe(ADDRESS);
    });

    test('takes precedence over PRIVATE_KEY_<chainId>', async () => {
      mockEnvs.PRIVATE_KEY_560048 =
        '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
      mockConfig.current = {
        PRIVATE_KEY_FILE: writeSecret('key', PRIVATE_KEY),
      };

      const account = await getAccount();
      expect(account.address).toBe(ADDRESS);
    });

    test('throws when PRIVATE_KEY is also set', async () => {
      mockConfig.current = {
        PRIVATE_KEY,
        PRIVATE_KEY_FILE: writeSecret('key', PRIVATE_KEY),
      };

      await expect(getAccount()).rejects.toThrow(
        'Provide only one of PRIVATE_KEY or PRIVATE_KEY_FILE',
      );
    });

    test('throws when ACCOUNT_FILE is also set', async () => {
      mockConfig.current = {
        PRIVATE_KEY_FILE: writeSecret('key', PRIVATE_KEY),
        ACCOUNT_FILE: writeKeystore(),
        ACCOUNT_FILE_PASSWORD: PASSWORD,
      };

      await expect(getAccount()).rejects.toThrow(
        'You must provide only one of the following',
      );
    });

    test('throws on empty file instead of falling back to another key', async () => {
      mockEnvs.PRIVATE_KEY_560048 = PRIVATE_KEY;
      const empty = writeSecret('key', '\n');
      mockConfig.current = { PRIVATE_KEY_FILE: empty };

      await expect(getAccount()).rejects.toThrow(
        `PRIVATE_KEY_FILE (${empty}) is empty`,
      );
    });

    test('throws on missing file', async () => {
      mockConfig.current = { PRIVATE_KEY_FILE: path.join(dir, 'missing') };

      await expect(getAccount()).rejects.toThrow('ENOENT');
    });
  });

  describe('ACCOUNT_FILE_PASSWORD_FILE', () => {
    test('decrypts keystore with password read from file', async () => {
      mockConfig.current = {
        ACCOUNT_FILE: writeKeystore(),
        ACCOUNT_FILE_PASSWORD_FILE: writeSecret('password', `${PASSWORD}\n`),
      };

      const account = await getAccount();
      expect(account.address).toBe(ADDRESS);
    });

    test('throws when ACCOUNT_FILE_PASSWORD is also set', async () => {
      mockConfig.current = {
        ACCOUNT_FILE: writeKeystore(),
        ACCOUNT_FILE_PASSWORD: PASSWORD,
        ACCOUNT_FILE_PASSWORD_FILE: writeSecret('password', PASSWORD),
      };

      await expect(getAccount()).rejects.toThrow(
        'Provide only one of ACCOUNT_FILE_PASSWORD or ACCOUNT_FILE_PASSWORD_FILE',
      );
    });

    test('throws on empty password file', async () => {
      const empty = writeSecret('password', '');
      mockConfig.current = {
        ACCOUNT_FILE: writeKeystore(),
        ACCOUNT_FILE_PASSWORD_FILE: empty,
      };

      await expect(getAccount()).rejects.toThrow(
        `ACCOUNT_FILE_PASSWORD_FILE (${empty}) is empty`,
      );
    });

    test('throws on missing password file', async () => {
      mockConfig.current = {
        ACCOUNT_FILE: writeKeystore(),
        ACCOUNT_FILE_PASSWORD_FILE: path.join(dir, 'missing'),
      };

      await expect(getAccount()).rejects.toThrow('ENOENT');
    });
  });
});
