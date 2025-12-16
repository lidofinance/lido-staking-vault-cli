import {
  createTestClient,
  http,
  publicActions,
  walletActions,
  type Address,
  type Chain,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Creates a test client for Anvil operations
 */
export const createAnvilTestClient = (chain: Chain, rpcUrl: string) => {
  return createTestClient({
    chain,
    mode: 'anvil',
    transport: http(rpcUrl),
  })
    .extend(publicActions)
    .extend(walletActions);
};

/**
 * Impersonates an account and funds it with ETH
 */
export const impersonateAccount = async (
  testClient: ReturnType<typeof createAnvilTestClient>,
  address: Address,
  balance: bigint = parseEther('100'),
) => {
  await testClient.impersonateAccount({ address });
  await testClient.setBalance({ address, value: balance });
  return address;
};

/**
 * Mints ETH to an address (sets balance)
 */
export const mintEth = async (
  testClient: ReturnType<typeof createAnvilTestClient>,
  address: Address,
  amount: bigint,
) => {
  await testClient.setBalance({ address, value: amount });
};

/**
 * Mines a specified number of blocks
 */
export const mineBlocks = async (
  testClient: ReturnType<typeof createAnvilTestClient>,
  blocks = 1,
) => {
  await testClient.mine({ blocks });
};

/**
 * Increases the time by a specified number of seconds
 */
export const increaseTime = async (
  testClient: ReturnType<typeof createAnvilTestClient>,
  seconds: number,
) => {
  await testClient.increaseTime({ seconds });
};

/**
 * Sets the time to a specific timestamp
 */
export const setTime = async (
  testClient: ReturnType<typeof createAnvilTestClient>,
  timestamp: bigint,
) => {
  await testClient.setNextBlockTimestamp({ timestamp });
  const blocks = timestamp / 12n;
  await testClient.mine({ blocks: Number(blocks) });
};

/**
 * Gets the current block timestamp
 */
export const getCurrentTimestamp = async (
  testClient: ReturnType<typeof createAnvilTestClient>,
) => {
  const block = await testClient.getBlock({ blockTag: 'latest' });
  return block.timestamp;
};

/**
 * Creates a wallet from a private key
 */
export const getAccountFromPrivateKey = (privateKey: string) => {
  return privateKeyToAccount(privateKey as `0x${string}`);
};
