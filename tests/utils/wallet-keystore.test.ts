import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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

vi.mock('command', () => ({
  program: { opts: () => ({}) },
}));

vi.mock('../../configs/index.js', () => ({
  getConfig: () => mockConfig.current,
  getChainId: async () => 560_048,
  getElUrl: () => 'http://localhost:8545',
  getChain: async () => ({ id: 560_048 }),
  envs: {},
}));

vi.mock('../../utils/index.js', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return { ...actual, createWalletConnectClient: vi.fn() };
});

const { getAccount } = await import('../../providers/wallet.js');

describe('getAccount with ACCOUNT_FILE keystore', () => {
  let dir: string;

  const useKeystore = (keystore: Keystore.Keystore, password = PASSWORD) => {
    const filePath = path.join(dir, 'account.json');
    writeFileSync(filePath, JSON.stringify(keystore));
    mockConfig.current = {
      ACCOUNT_FILE: filePath,
      ACCOUNT_FILE_PASSWORD: password,
    };
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'wallet-keystore-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  test('decrypts pbkdf2 keystore with non-default iterations', async () => {
    const [key, opts] = Keystore.pbkdf2({
      password: PASSWORD,
      iterations: 1000,
    });
    useKeystore(Keystore.encrypt(PRIVATE_KEY, key, opts));

    const account = await getAccount();
    expect(account.address).toBe(ADDRESS);
  });

  // Low scrypt cost keeps the test fast
  test('decrypts scrypt keystore', async () => {
    const [key, opts] = Keystore.scrypt({ password: PASSWORD, n: 1024 });
    useKeystore(Keystore.encrypt(PRIVATE_KEY, key, opts));

    const account = await getAccount();
    expect(account.address).toBe(ADDRESS);
  });

  test('rejects wrong password', async () => {
    const [key, opts] = Keystore.scrypt({ password: PASSWORD, n: 1024 });
    useKeystore(Keystore.encrypt(PRIVATE_KEY, key, opts), 'wrong');

    await expect(getAccount()).rejects.toThrow('corrupt keystore');
  });
});
