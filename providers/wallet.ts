import { readFileSync } from 'node:fs';
import { program } from 'command';
import {
  Address,
  createPublicClient,
  createWalletClient,
  http,
  maxUint256,
  WalletClient,
  createTestClient,
  walletActions,
  publicActions,
} from 'viem';
import { estimateGas } from 'viem/actions';
import { privateKeyToAccount } from 'viem/accounts';
import { Keystore } from 'ox';

import { envs, getConfig, getChainId, getElUrl, getChain } from 'configs';
import { createWalletConnectClient } from 'utils';

const getPrivateKey = async () => {
  const { PRIVATE_KEY, ACCOUNT_FILE, ACCOUNT_FILE_PASSWORD } = getConfig();
  const id = await getChainId();

  if (PRIVATE_KEY && ACCOUNT_FILE) {
    throw new Error(
      'You must provide only one of the following: private key or encrypted account file',
    );
  }

  if (PRIVATE_KEY) {
    return PRIVATE_KEY;
  }

  if (envs?.[`PRIVATE_KEY_${id}`]) {
    return envs[`PRIVATE_KEY_${id}`];
  }

  if (ACCOUNT_FILE) {
    if (!ACCOUNT_FILE_PASSWORD) {
      throw new Error('Account file password is not provided');
    }

    const file = readFileSync(ACCOUNT_FILE, 'utf8');
    const fileContent: Keystore.Keystore = JSON.parse(file);

    const kdfType = fileContent.crypto.kdf;

    const [key] = Keystore[kdfType]({
      password: ACCOUNT_FILE_PASSWORD,
      ...fileContent.crypto.kdfparams,
      salt: `0x${fileContent.crypto.kdfparams.salt}`,
      iv: `0x${fileContent.crypto.cipherparams.iv}`,
    });
    const privateKey = Keystore.decrypt(fileContent, key);

    return privateKey;
  }

  throw new Error('Private key or encrypted account file is not provided');
};

export const getAccount = async () => {
  const id = await getChainId();

  if (program.opts().walletConnect) {
    const { walletConnectClient } = await getWalletConnectClient();

    if (!walletConnectClient.account) {
      throw new Error('Wallet connect account is not found');
    }

    return walletConnectClient.account;
  }

  const privateKey = await getPrivateKey();

  if (!privateKey) {
    throw new Error(`Private key for ${id} chain is not set`);
  }

  return privateKeyToAccount(privateKey as Address);
};

export type RegisteredPublicClient = ReturnType<typeof createPublicClient>;

const PUBLIC_CLIENT_CACHE: {
  [key: number]: ReturnType<typeof createPublicClient>;
} = {};

/**
 * Returns an estimateGas override that injects a `stateOverride` with
 * maxUint256 balance for the sender during gas estimation only.
 *
 * Why: viem's `prepareTransactionRequest` fills `maxFeePerGas` BEFORE
 * calling `eth_estimateGas`. The node then checks
 * `balance >= blockGasLimit * maxFeePerGas`, which fails for low-balance
 * accounts even though the actual TX cost is much lower.
 *
 * The `baseClient` parameter MUST be the client created before `extend()`,
 * otherwise the override re-enters itself via `prepareTransactionRequest →
 * getAction → override → …` (infinite recursion).
 *
 * Falls back to default estimation if the RPC does not support
 * `stateOverride` (geth < 1.13).
 */
const balanceAwareEstimateGas = (
  baseClient: Parameters<typeof estimateGas>[0],
) => ({
  estimateGas: async (args: Parameters<typeof estimateGas>[1]) => {
    const from =
      typeof args.account === 'string' ? args.account : args.account?.address;

    if (!from) {
      return await estimateGas(baseClient, args);
    }

    try {
      return await estimateGas(baseClient, {
        ...args,
        stateOverride: [
          ...(args.stateOverride ?? []),
          { address: from, balance: maxUint256 },
        ],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('stateOverride') ||
        msg.includes('too many arguments') ||
        msg.includes('invalid argument')
      ) {
        return await estimateGas(baseClient, args);
      }
      throw err;
    }
  },
});

/**
 * Public client with balance-aware gas estimation.
 *
 * All contracts are created with `client: publicClient`, so viem uses it
 * for the entire `contract.write` chain (writeContract → sendTransaction →
 * prepareTransactionRequest → estimateGas). The override here covers all
 * contract write paths automatically.
 */
export const getPublicClient = async () => {
  const chain = await getChain();

  const cached = PUBLIC_CLIENT_CACHE[chain.id];
  if (cached) {
    return cached as typeof publicClient;
  }

  const baseClient = createPublicClient({
    chain,
    transport: http(getElUrl()),
  });

  const publicClient = baseClient.extend(() =>
    balanceAwareEstimateGas(baseClient),
  );

  PUBLIC_CLIENT_CACHE[chain.id] = publicClient;

  return publicClient;
};

export const getTestClient = async () => {
  return createTestClient({
    chain: await getChain(),
    mode: 'anvil',
    transport: http(getElUrl()),
  })
    .extend(publicActions)
    .extend(walletActions);
};

/**
 * Wallet client with the same balance-aware gas estimation override.
 *
 * Covers the `send-tx` command path which uses
 * `walletClient.sendTransaction()` directly (not via contract.write).
 */
export const getWalletWithAccount = async (): Promise<WalletClient> => {
  const account = await getAccount();
  const chain = await getChain();

  const baseClient = createWalletClient({
    account,
    chain,
    transport: http(getElUrl()),
  });

  return baseClient.extend(() =>
    balanceAwareEstimateGas(baseClient),
  ) as unknown as WalletClient;
};

export const getWalletConnectClient = async (): Promise<{
  walletConnectClient: WalletClient;
  isGnosis: boolean;
  supportsWalletSendCalls: boolean;
}> => {
  const walletConnectClient = await createWalletConnectClient();

  return walletConnectClient;
};
