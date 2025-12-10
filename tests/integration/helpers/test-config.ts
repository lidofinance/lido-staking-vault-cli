import * as dotenv from 'dotenv';
import { Address, type Chain } from 'viem';
import { SUPPORTED_CHAINS_LIST } from 'configs';
import { readFileSync } from 'fs';
import path from 'path';

// Load environment variables from .env.test or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
dotenv.config(); // Fallback to .env if .env.test doesn't exist

export interface IntegrationTestConfig {
  DEPLOYED: string;
  CHAIN_ID: number;
  EL_URL: string;
  PRIVATE_KEY: string;
  VAULT_ADDRESS: Address;
  FORK_BLOCK_NUMBER?: number;
  ANVIL_PORT: number;
}

/**
 * Validates and loads integration test configuration from environment variables
 */
export const loadTestConfig = (): IntegrationTestConfig => {
  const DEPLOYED = process.env.DEPLOYED;
  const CHAIN_ID = process.env.CHAIN_ID;
  const EL_URL = process.env.EL_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const VAULT_ADDRESS = process.env.VAULT_ADDRESS;
  const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER;
  const ANVIL_PORT = process.env.ANVIL_PORT || '8545';

  if (!DEPLOYED) {
    throw new Error('DEPLOYED environment variable is required');
  }
  if (!CHAIN_ID) {
    throw new Error('CHAIN_ID environment variable is required');
  }
  if (!EL_URL) {
    throw new Error('EL_URL environment variable is required');
  }
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }
  if (!VAULT_ADDRESS) {
    throw new Error('VAULT_ADDRESS environment variable is required');
  }

  const chainId = Number(CHAIN_ID);
  if (isNaN(chainId)) {
    throw new Error(`Invalid CHAIN_ID: ${CHAIN_ID}`);
  }

  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(VAULT_ADDRESS)) {
    throw new Error(`Invalid VAULT_ADDRESS format: ${VAULT_ADDRESS}`);
  }

  // Validate private key format
  if (!/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
    throw new Error(`Invalid PRIVATE_KEY format`);
  }

  const forkBlockNumber = FORK_BLOCK_NUMBER
    ? Number(FORK_BLOCK_NUMBER)
    : undefined;

  if (
    FORK_BLOCK_NUMBER &&
    forkBlockNumber !== undefined &&
    isNaN(forkBlockNumber)
  ) {
    throw new Error(`Invalid FORK_BLOCK_NUMBER: ${FORK_BLOCK_NUMBER}`);
  }

  return {
    DEPLOYED,
    CHAIN_ID: chainId,
    EL_URL,
    PRIVATE_KEY,
    VAULT_ADDRESS: VAULT_ADDRESS as Address,
    FORK_BLOCK_NUMBER: forkBlockNumber,
    ANVIL_PORT: Number(ANVIL_PORT),
  };
};

/**
 * Gets the chain configuration for the test
 */
export const getTestChain = (chainId: number): Chain => {
  const chain = SUPPORTED_CHAINS_LIST.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`Chain ${chainId} is not supported`);
  }
  return chain;
};

/**
 * Loads deployed contracts configuration
 */
export const loadDeployedContracts = (deployedFileName: string) => {
  const fullPath = path.resolve('configs', deployedFileName);
  try {
    const fileContent = readFileSync(fullPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(
      `Failed to load deployed contracts file: ${fullPath}. Error: ${error}`,
    );
  }
};

/**
 * Gets the RPC URL for Anvil (local)
 */
export const getAnvilRpcUrl = (port: number): string => {
  return `http://127.0.0.1:${port}`;
};
