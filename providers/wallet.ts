import { readFileSync } from 'node:fs';
import { program } from 'command';
import {
  Address,
  createPublicClient,
  createWalletClient,
  http,
  type Transport,
  WalletClient,
  createTestClient,
  walletActions,
  publicActions,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Keystore } from 'ox';

import { envs, getConfig, getChainId, getElUrl, getChain } from 'configs';
import { createWalletConnectClient } from 'utils';

const MAX_UINT256_HEX =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

/**
 * Wraps viem's http() transport to inject a `stateOverride` into every
 * `eth_estimateGas` RPC call, setting the sender's balance to maxUint256.
 *
 * Why: viem's `prepareTransactionRequest` fills `maxFeePerGas` BEFORE
 * calling `eth_estimateGas`. The node then checks
 * `balance >= blockGasLimit * maxFeePerGas`, which fails for low-balance
 * accounts even though the actual TX cost is much lower.
 *
 * Operating at the transport level guarantees the override is applied
 * regardless of how viem resolves its internal action chain (the
 * `client.extend()` approach does not work because viem's bound methods
 * close over the original base client and `getAction` short-circuits).
 *
 * Falls back to the original call if the RPC does not support
 * `stateOverride` (geth < 1.13).
 */
const balanceAwareTransport = (url: string): Transport => {
  const baseTransport = http(url);

  return ((params: any) => {
    const base = baseTransport(params);

    return {
      ...base,
      async request(args: { method: string; params?: any }) {
        if (
          args.method === 'eth_estimateGas' &&
          Array.isArray(args.params) &&
          args.params[0]?.from
        ) {
          const from: string = args.params[0].from;
          const txRequest = args.params[0];
          const blockTag = args.params[1] ?? 'latest';
          const existingOverride =
            (args.params[2] as Record<string, unknown>) ?? {};

          const stateOverride = {
            ...existingOverride,
            [from]: { balance: MAX_UINT256_HEX },
          };

          try {
            return await base.request({
              method: 'eth_estimateGas',
              params: [txRequest, blockTag, stateOverride],
            });
          } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err);
            if (
              msg.includes('stateOverride') ||
              msg.includes('too many arguments') ||
              msg.includes('invalid argument')
            ) {
              return await base.request(args);
            }
            throw err;
          }
        }

        return base.request(args);
      },
    };
  }) as Transport;
};

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

export const getPublicClient = async () => {
  const chain = await getChain();

  const cached = PUBLIC_CLIENT_CACHE[chain.id];
  if (cached) {
    return cached as typeof publicClient;
  }

  const publicClient = createPublicClient({
    chain,
    transport: balanceAwareTransport(getElUrl()),
  });
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

export const getWalletWithAccount = async (): Promise<WalletClient> => {
  const account = await getAccount();
  const chain = await getChain();

  return createWalletClient({
    account,
    chain,
    transport: balanceAwareTransport(getElUrl()),
  });
};

export const getWalletConnectClient = async (): Promise<{
  walletConnectClient: WalletClient;
  isGnosis: boolean;
  supportsWalletSendCalls: boolean;
}> => {
  const walletConnectClient = await createWalletConnectClient();

  return walletConnectClient;
};
