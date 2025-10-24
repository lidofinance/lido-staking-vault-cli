import { SignClient } from '@walletconnect/sign-client';
import qrcode from 'qrcode-terminal';
import {
  createWalletClient,
  custom,
  type WalletClient,
  type Account,
  type Address,
} from 'viem';

import { getConfig, getChain } from 'configs';
import { logInfo, logError } from 'utils/logging/index.js';
import { sleep } from 'utils/sleep.js';

const DESCRIPTION = 'Lido Staking Vault CLI';
const URL = 'https://github.com/lidofinance/lido-staking-vault-cli';
const ICONS = [
  'https://github.com/lidofinance/lido-staking-vault-cli/blob/develop/docs/static/img/favicon.png',
];
const NAME = 'Lido Staking Vault CLI';

interface WalletConnectOptions {
  maxRetries?: number;
  connectionTimeout?: number;
  showQR?: boolean;
}

// Retry settings
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_CONNECTION_TIMEOUT = 180_000; // 180 seconds
// Cache for the wallet connect client
let cachedWalletConnectClient: WalletClient | null = null;
let cachedSignClient: Awaited<ReturnType<typeof SignClient.init>> | null = null;
// TODO: fix this type
let cachedSession: any | null = null;

// Create a wallet connect client
export const createWalletConnectClient = async () => {
  try {
    const chain = getChain();

    // If the wallet connect client is already created, return it
    if (cachedWalletConnectClient) {
      return cachedWalletConnectClient;
    }

    const { session, accounts } = await connectWalletConnectWithRetry();
    logInfo('Found accounts:', accounts.length);

    // Get the address from the accounts
    const address = accounts[0]?.split(':')[2] as Address;

    // If no address is found, throw an error
    if (!address) {
      throw new Error('No address found. Check your wallet and try again.');
    }

    // Log the connected account
    logInfo('Connected to WalletConnect with the following account:', address);
    logInfo('Waiting for transaction...');

    // Create an account object
    const account: Account = {
      address,
      type: 'json-rpc',
    };

    // Create a wallet connect client
    const walletConnectClient = createWalletClient({
      account,
      chain: getChain(),
      transport: custom({
        async request({ method, params }) {
          return await cachedSignClient?.request({
            topic: session.topic,
            chainId: `eip155:${chain.id}`,
            request: { method, params },
          });
        },
      }),
    });

    // Cache the wallet connect client and account
    cachedWalletConnectClient = walletConnectClient;

    return cachedWalletConnectClient;
  } catch (error) {
    logError('Error creating wallet connect client:', error);
    throw error;
  }
};

export const connectWalletConnectWithRetry = async (
  options: WalletConnectOptions = {},
) => {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    connectionTimeout = DEFAULT_CONNECTION_TIMEOUT,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logInfo(`WalletConnect connection attempt ${attempt}/${maxRetries}...`);

      const result = await connectWalletConnectWithTimeout(connectionTimeout);

      logInfo('✅ WalletConnect connected successfully!');
      return result;
    } catch (error) {
      lastError = error as Error;
      logError(`❌ Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        logInfo(`⏳ Retrying in 2 seconds...`);
        await sleep(2000);

        // Clear the cache for a new attempt
        cachedSignClient = null;
        cachedWalletConnectClient = null;
      }
    }
  }

  throw new Error(
    `Failed to connect to WalletConnect after ${maxRetries} attempts. Last error: ${lastError?.message}`,
  );
};

const connectWalletConnectWithTimeout = async (
  timeout: number,
): Promise<{ session: any; accounts: string[] }> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Connection timeout after ${timeout}ms`));
    }, timeout);

    try {
      const result = await connectWalletConnect();
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

const connectWalletConnect = async () => {
  const chain = getChain();
  const { WALLET_CONNECT_PROJECT_ID } = getConfig();

  // Initialize the wallet connect client
  const signClient = await SignClient.init({
    projectId: WALLET_CONNECT_PROJECT_ID,
    logger: 'error',
    metadata: {
      description: DESCRIPTION,
      url: URL,
      icons: ICONS,
      name: NAME,
    },
  });

  cachedSignClient = signClient;

  logInfo('Used Chain:', chain.id);
  logInfo('Connecting to WalletConnect...');

  // Connect to WalletConnect
  const { uri, approval } = await signClient.connect({
    optionalNamespaces: {
      eip155: {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_accounts',
          'eth_sign',
          'eth_chainId',
          'wallet_sendCalls',
          'wallet_getCallsStatus',
        ],
        chains: [`eip155:${chain.id}`],
        events: ['chainChanged', 'accountsChanged'],
      },
    },
  });

  // If no URI is found, throw an error
  if (!uri) {
    throw new Error('No WalletConnect URI found. Try again.');
  }

  // Log the WalletConnect URI
  logInfo(`\nPlease navigate to url:\n\n${uri}\n\nor scan QR code:\n`);
  qrcode.generate(uri, { small: true });

  logInfo('Waiting for approval...');
  // Wait for the user to approve the connection
  const session = await approval();
  cachedSession = session;
  const accounts = session.namespaces.eip155?.accounts;

  logInfo('Session topic:', session.topic);
  logInfo(
    `Session expiration: ${new Date(session.expiry * 1000).toLocaleString()}`,
  );

  // If no accounts are found, throw an error
  if (!accounts) {
    throw new Error('No accounts found. Check your wallet and try again.');
  }

  return {
    session,
    accounts,
  };
};

export const disconnectWalletConnect = async () => {
  await cachedSignClient?.disconnect({
    topic: cachedSession?.topic as string,
    reason: {
      code: 4001,
      message: 'Disconnect from app',
    },
  });
  cachedSignClient = null;
  cachedWalletConnectClient = null;
  cachedSession = null;
};
