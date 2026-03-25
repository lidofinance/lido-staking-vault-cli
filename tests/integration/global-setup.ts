import { createAnvil } from '@viem/anvil';
import * as dotenv from 'dotenv';
import path from 'node:path';

// Load environment variables from .env.test or .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
dotenv.config(); // Fallback to .env if .env.test doesn't exist

// Global anvil instance
let anvilInstance: Awaited<ReturnType<typeof createAnvil>> | null = null;

export default async function globalSetup() {
  const ANVIL_PORT = Number(process.env.ANVIL_PORT || '8545');
  const FORK_URL = process.env.EL_URL;
  const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER
    ? Number(process.env.FORK_BLOCK_NUMBER)
    : undefined;
  const CHAIN_ID = Number(process.env.CHAIN_ID || '1');

  if (!FORK_URL) {
    throw new Error(
      'EL_URL environment variable is required for integration tests',
    );
  }

  console.info('Starting Anvil fork...');
  console.info(`Fork URL: ${FORK_URL}`);
  console.info(`Fork Block Number: ${FORK_BLOCK_NUMBER || 'latest'}`);
  console.info(`Chain ID: ${CHAIN_ID}`);
  console.info(`Port: ${ANVIL_PORT}`);

  // Create Anvil instance
  const anvil = createAnvil({
    port: ANVIL_PORT,
    forkUrl: FORK_URL,
    forkBlockNumber: FORK_BLOCK_NUMBER,
    chainId: CHAIN_ID,
  });

  // Start Anvil
  await anvil.start();

  // Update EL_URL to point to local anvil
  const anvilRpcUrl = `http://127.0.0.1:${ANVIL_PORT}`;
  process.env.EL_URL = anvilRpcUrl;

  console.info(`Anvil started successfully`);
  console.info(`Anvil RPC URL: ${anvilRpcUrl}`);

  // Store instance for teardown
  anvilInstance = anvil;

  // Return a teardown function for Vitest
  return async () => {
    try {
      if (anvilInstance) {
        console.info('Stopping Anvil...');
        await anvilInstance.stop();
        console.info('Anvil stopped');
        anvilInstance = null;
      }
    } catch (error: any) {
      console.error(`Error during teardown: ${error.message}`);
    }
  };
}
