import { SignClient } from '@walletconnect/sign-client';
import qrcode from 'qrcode-terminal';
import {
  createWalletClient,
  custom,
  type WalletClient,
  type Account,
  type Address,
  type Chain,
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
let cachedWalletConnectClient: {
  walletConnectClient: WalletClient;
  isGnosis: boolean;
  supportsWalletSendCalls: boolean;
} | null = null;
let cachedSignClient: Awaited<ReturnType<typeof SignClient.init>> | null = null;
// TODO: fix this type
let cachedSession: any | null = null;

type Peer = {
  publicKey: string;
  metadata: {
    description: string;
    url: string;
    icons: string[];
    name: string;
  };
};

const isGnosisSafe = (peer: Peer) => {
  const { name, url } = peer.metadata;
  const isUrlSafe =
    url.includes('https://app.safe.global') ||
    url.includes('https://app.safe.protofire.io');
  const isNameSafe =
    name.includes('Safe{Wallet}') || name.includes('Protofire Safe');

  return isUrlSafe && isNameSafe;
};

// Create a wallet connect client
export const createWalletConnectClient = async () => {
  try {
    const chain = await getChain();

    // If the wallet connect client is already created, return it
    if (cachedWalletConnectClient) {
      return cachedWalletConnectClient;
    }

    const { session, accounts, isGnosis, supportsWalletSendCalls } =
      await connectWalletConnectWithRetry();
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
      chain,
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
    cachedWalletConnectClient = {
      walletConnectClient,
      isGnosis,
      supportsWalletSendCalls,
    };

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
): Promise<{
  session: any;
  accounts: string[];
  isGnosis: boolean;
  supportsWalletSendCalls: boolean;
}> => {
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

const connectWalletConnect = async (): Promise<{
  session: any;
  accounts: string[];
  isGnosis: boolean;
  supportsWalletSendCalls: boolean;
}> => {
  const chain = await getChain();
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
          'wallet_getCapabilities',
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
  const isGnosis = isGnosisSafe(session.peer);
  if (isGnosis) {
    logInfo('Using Gnosis Safe to send transactions...');
  }

  const approvedMethods = session.namespaces.eip155?.methods || [];
  const declaredSendCalls = approvedMethods.includes('wallet_sendCalls');

  // Verify actual capability via EIP-5792 wallet_getCapabilities.
  // Wallets like MetaMask declare wallet_sendCalls in the session but require
  // EIP-7702 to be enabled by the user — wallet_getCapabilities returns the
  // true runtime support per chain.
  let supportsWalletSendCalls = false;
  if (declaredSendCalls) {
    logInfo('Checking wallet_getCapabilities...');
    // EIP-5792: wallet_getCapabilities takes the account address as first param
    const accountAddress = accounts?.[0]?.split(':')[2];

    supportsWalletSendCalls = await checkWalletSendCallsSupport(
      session,
      chain,
      accountAddress,
    );
  }

  if (!supportsWalletSendCalls) {
    logInfo(
      'wallet_sendCalls not available, will use eth_sendTransaction fallback',
    );
  }

  // If no accounts are found, throw an error
  if (!accounts) {
    throw new Error('No accounts found. Check your wallet and try again.');
  }

  return {
    session,
    accounts,
    isGnosis,
    supportsWalletSendCalls,
  };
};

export const checkWalletSendCallsSupport = async (
  session: any,
  chain: Chain,
  accountAddress?: string,
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const capabilities = await cachedSignClient!.request<
      Record<
        string,
        {
          atomic?: { status: string };
          atomicBatch?: { supported: boolean };
        }
      >
    >({
      topic: session.topic,
      chainId: `eip155:${chain.id}`,
      request: {
        method: 'wallet_getCapabilities',
        params: [accountAddress],
      },
    });
    const chainKey = `0x${chain.id.toString(16)}`;
    const cap = capabilities?.[chainKey];
    // EIP-5792 final spec uses atomic.status === 'supported'
    // Some older wallet implementations use atomicBatch.supported === true
    const supportsWalletSendCalls =
      cap?.atomic?.status === 'supported' ||
      cap?.atomicBatch?.supported === true;
    logInfo(
      `wallet_getCapabilities: atomic batch supported = ${supportsWalletSendCalls}`,
    );

    return supportsWalletSendCalls;
  } catch {
    // wallet_getCapabilities not supported or failed — fall back to individual txs
    logInfo(
      'wallet_getCapabilities unavailable — will use eth_sendTransaction fallback',
    );

    return false;
  }
};

export const disconnectWalletConnect = async () => {
  if (!cachedSignClient) return;

  await cachedSignClient.disconnect({
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
