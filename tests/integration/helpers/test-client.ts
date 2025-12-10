import {
  createTestClient,
  createPublicClient,
  createWalletClient,
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
 * Creates a public client for reading blockchain state
 */
export const createAnvilPublicClient = (chain: Chain, rpcUrl: string) => {
  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
};

/**
 * Creates a wallet client for sending transactions
 */
export const createAnvilWalletClient = (
  chain: Chain,
  rpcUrl: string,
  account: Address,
) => {
  return createWalletClient({
    chain,
    transport: http(rpcUrl),
    account,
  });
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
 * Stops impersonating an account
 * Note: In Anvil, impersonation persists until the node is restarted
 * or the account is explicitly stopped via RPC call
 */
export const stopImpersonatingAccount = async (
  testClient: ReturnType<typeof createAnvilTestClient>,
  address: Address,
) => {
  // Anvil doesn't have a direct stopImpersonateAccount method
  // Impersonation is typically handled automatically
  // If needed, we can send a custom RPC call
  await testClient.request({
    method: 'anvil_stopImpersonatingAccount',
    params: [address],
  } as any);
};

/**
 * Mints ETH to an address
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
  await testClient.mine();
};

/**
 * Gets the current block timestamp
 */
export const getCurrentTimestamp = async (
  publicClient: ReturnType<typeof createAnvilPublicClient>,
) => {
  const block = await publicClient.getBlock({ blockTag: 'latest' });
  return block.timestamp;
};

/**
 * Creates a wallet from a private key
 */
export const getAccountFromPrivateKey = (privateKey: string) => {
  return privateKeyToAccount(privateKey as `0x${string}`);
};
