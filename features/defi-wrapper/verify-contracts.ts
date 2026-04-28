import { DefiWrapperSources } from 'abi/defi-wrapper/sources.js';
import { logInfo, RateLimitedFetch } from 'index.js';
import { getPublicClient } from 'providers/wallet.js';
import { Address, Hash } from 'viem';

const EtherscanApi = new RateLimitedFetch(500); // at least 500ms delay between requests to avoid hitting rate limits

type ContractName = keyof typeof DefiWrapperSources;

export const checkExistingVerification = async (
  address: Address,
  etherscanApiKey: string,
) => {
  const chainId = (await getPublicClient()).chain.id;
  const params = new URLSearchParams({
    chainid: chainId.toString(),
    module: 'contract',
    action: 'getsourcecode',
    address,
    apikey: etherscanApiKey,
  });
  const url = `https://api.etherscan.io/v2/api?${params}`;

  const response = await EtherscanApi.fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch verification data: ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (data.status !== '1' || !data.result || data.result.length === 0) {
    throw new Error(`No verification data found for address: ${address}`);
  }
  return data.result[0].SourceCode !== ''; // Already verified
};

export const checkVerificationStatus = async (
  guid: string,
  etherscanApiKey: string,
): Promise<any> => {
  const chainId = (await getPublicClient()).chain.id;
  const params = new URLSearchParams({
    guid,
    action: 'checkverifystatus',
    module: 'contract',
    chainid: chainId.toString(),
    apikey: etherscanApiKey,
  });
  const url = `https://api.etherscan.io/v2/api?${params}`;

  const response = await EtherscanApi.fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch verification status: ${response.statusText}`,
    );
  }

  const data = await response.json();
  if (data.status !== '1' || !data.result || data.result.length === 0) {
    throw new Error(`No verification status found for GUID: ${guid}`);
  }
  return data.result[0].result; // "Pass - Verified" or "Fail - Unable to verify"
};

export const verifyContract = async (
  contract: ContractName,
  address: Address,
  etherscanApiKey: string,
) => {
  const chainId = (await getPublicClient()).chain.id;
  const sourceData = DefiWrapperSources[contract];
  if (!sourceData) {
    throw new Error(
      `No source data found for contract: ${contract}. Available contracts: ${Object.keys(DefiWrapperSources).join(', ')}`,
    );
  }

  const alreadyVerified = await checkExistingVerification(
    address,
    etherscanApiKey,
  );

  if (alreadyVerified) {
    logInfo('Contract is already verified.');
    return;
  }

  const body = new URLSearchParams({
    apikey: etherscanApiKey,
    chainid: chainId.toString(),
    module: 'contract',
    action: 'verifysourcecode',
    contractaddress: address,
    sourceCode: JSON.stringify(JSON.parse(sourceData.SourceCode)),
    codeformat: sourceData.codeformat,
    contractname: `${sourceData.ContractFileName}:${sourceData.ContractName}`,
    compilerversion: sourceData.CompilerVersion,
    optimizationUsed: sourceData.OptimizationUsed,
    runs: sourceData.Runs,
    evmVersion: sourceData.EVMVersion,
  });

  const res = await EtherscanApi.fetch(
    `https://api.etherscan.io/v2/api?chainid=${chainId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to submit verification: ${res.statusText}`);
  }

  const result = await res.json();

  if (result.status !== '1') {
    throw new Error(`Verification failed: ${result.result}`);
  }

  const guid = result.result;
  logInfo(`Verification submitted. GUID: ${guid}`);

  for (let i = 0; i < 10; i++) {
    logInfo(`Checking verification status (attempt ${i + 1}/10)...`);
    const status = await checkVerificationStatus(guid, etherscanApiKey);
    logInfo(`Current status: ${status}`);
    if (status === 'Pass - Verified') {
      logInfo('Contract verified successfully!');
      return;
    } else if (status === 'Fail - Unable to verify') {
      throw new Error('Verification failed after submission.');
    }
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds before retrying
  }

  throw new Error('Verification status check timed out.');
};

const POOL_TYPE_CONTRACT = {
  '0x537476506f6f6c00000000000000000000000000000000000000000000000007':
    'stvPoolImpl',
  // stvStethPool and stvStetStrategy have same implementation
  '0x5374765374455448506f6f6c000000000000000000000000000000000000000c':
    'stvStethPoolImpl',
  '0x5374765374726174656779506f6f6c000000000000000000000000000000000f':
    'stvStethPoolImpl',
} as { [key in Hash]: keyof typeof DefiWrapperSources };

const STRATEGY_TYPE_CONTRACT = {
  '0x3b0e47226370dd0daa4b28feb910df52f3fa507a32622521ef348962830e24cd':
    'mellowStrategyImpl',
} as {
  [key in Hash]: keyof typeof DefiWrapperSources;
};

type VerifyDefiWrapperDeploymentParams = {
  etherscanApiKey: string;
  poolType: Hash;
  strategyType: Hash | null;

  poolProxy: Address;
  poolImpl: Address;

  withdrawalQueue: Address;
  withdrawalQueueImpl: Address;

  strategyProxy: Address | null;
  strategyImpl: Address | null;

  timelock: Address;
};

export const verifyDefiWrapperDeployment = async ({
  etherscanApiKey,
  poolProxy,
  poolImpl,
  poolType,
  withdrawalQueue,
  withdrawalQueueImpl,
  timelock,
  strategyType,
  strategyImpl,
  strategyProxy,
}: VerifyDefiWrapperDeploymentParams) => {
  logInfo('Verifying Pool Proxy...');
  await verifyContract('proxy', poolProxy, etherscanApiKey);
  logInfo('Pool Proxy verified successfully!');

  logInfo('Verifying Pool Implementation...');
  const poolContract = POOL_TYPE_CONTRACT[poolType];
  if (!poolContract) {
    throw new Error(`Unknown pool type for proxy: ${poolProxy}`);
  }
  await verifyContract(poolContract, poolImpl, etherscanApiKey);
  logInfo('Pool Implementation verified successfully!');

  logInfo('Verifying Withdrawal Queue Proxy...');
  await verifyContract('proxy', withdrawalQueue, etherscanApiKey);
  logInfo('Withdrawal Queue Proxy verified successfully!');

  logInfo('Verifying Withdrawal Queue Implementation...');
  await verifyContract('wqImpl', withdrawalQueueImpl, etherscanApiKey);
  logInfo('Withdrawal Queue Implementation verified successfully!');

  logInfo('Verifying TimeLock...');
  await verifyContract('timelock', timelock, etherscanApiKey);
  logInfo('TimeLock verified successfully!');

  if (strategyType) {
    if (!strategyImpl || !strategyProxy) {
      throw new Error(
        'Strategy type is set but strategy implementation or proxy address is missing',
      );
    }

    logInfo('Verifying Strategy Proxy...');
    await verifyContract('proxy', strategyProxy, etherscanApiKey);
    logInfo('Strategy Proxy verified successfully!');

    const strategyContract = STRATEGY_TYPE_CONTRACT[strategyType];
    if (!strategyContract) {
      throw new Error(`Unknown strategy type for proxy: ${strategyProxy}`);
    }

    logInfo('Verifying Strategy Implementation...');
    await verifyContract(strategyContract, strategyImpl, etherscanApiKey);
    logInfo('Strategy Implementation verified successfully!');
  }

  logInfo('All contracts verified successfully!');
};
