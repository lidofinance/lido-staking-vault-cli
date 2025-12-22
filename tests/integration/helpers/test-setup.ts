import { beforeAll, beforeEach } from 'vitest';
import { getChain } from 'configs';
import { loadTestConfig } from './test-config.js';
import { createAnvilTestClient, resetAnvilState } from './test-client.js';

const resetAnvil = async () => {
  const config = loadTestConfig();
  const chain = await getChain();
  const anvilRpcUrl = config.EL_URL;
  const testClient = createAnvilTestClient(chain, anvilRpcUrl);
  const forkBlockNumber = BigInt(config.FORK_BLOCK_NUMBER || 'latest');

  // Reset Anvil state to the fork block number
  if (testClient) {
    await resetAnvilState(testClient, forkBlockNumber);
  }
};

/**
 * Sets up beforeEach hook to reset Anvil state to the fork block number
 * This ensures tests don't affect each other
 */
export const setupAnvilResetBeforeEach = () => {
  beforeEach(async () => {
    await resetAnvil();
  });
};

export const setupAnvilResetBeforeAll = () => {
  beforeAll(async () => {
    await resetAnvil();
  });
};

/**
 * Sets up both Anvil reset and callWriteMethodWithReceipt mock
 * This is the recommended setup for integration tests
 */
export const setupIntegrationTestsBeforeEach = () => {
  setupAnvilResetBeforeEach();
};

export const setupIntegrationTestsBeforeAll = () => {
  setupAnvilResetBeforeAll();
};
