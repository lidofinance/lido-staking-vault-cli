import { lstatSync, readFileSync } from 'fs';
import * as process from 'node:process';
import path from 'path';
import { zeroAddress, Address, Chain } from 'viem';

import { getValueByPath, logError, logInfo, validateConfig } from 'utils';
import { Config } from 'types';

import { envs } from './envs.js';
import { SUPPORTED_CHAINS_LIST } from './constants.js';

export const importDeployFile = () => {
  const fullPath = path.resolve('configs', envs?.DEPLOYED ?? '');
  if (!fullPath) {
    throw new Error('Deployed contracts file is not set, check .env file');
  }

  let json: Record<string, number | string | Chain | any> = {};

  if (lstatSync(fullPath).isFile()) {
    const fileContent = readFileSync(fullPath, 'utf-8');
    const config = JSON.parse(fileContent);
    json = structuredClone(config);
  }

  return json;
};

export const importConfigFromEnv = () => {
  const config = envs as unknown as Config;
  config.CHAIN_ID = Number(config.CHAIN_ID);

  return config;
};

export const getConfig = () => {
  const config = importConfigFromEnv();

  const errors = validateConfig(config as unknown as Config);
  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    errorKeys.forEach((key) => console.error(`${errors[key as keyof Config]}`));
    process.exit(1);
  }

  return config;
};

export const getDeployed = () => {
  const deployedJSON = importDeployFile();

  return deployedJSON;
};

let chainIdCache: number | undefined;
const getRpcChainId = async (elURL: string | undefined) => {
  if (!elURL) {
    return undefined;
  }

  if (chainIdCache) {
    return chainIdCache;
  }

  try {
    const rpcChainIdResponse = await fetch(elURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_chainId',
        params: [],
      }),
    });

    if (!rpcChainIdResponse?.ok) {
      throw new Error(
        `RPC request failed: ${rpcChainIdResponse.status} ${rpcChainIdResponse.statusText}`,
      );
    }

    const rpcChainIdData = await rpcChainIdResponse.json();
    if (rpcChainIdData?.error) {
      throw new Error(
        `RPC error: ${rpcChainIdData.error.message || JSON.stringify(rpcChainIdData.error)}`,
      );
    }

    const rpcChainId = parseInt(rpcChainIdData.result, 16);
    chainIdCache = rpcChainId;

    return rpcChainId;
  } catch (error) {
    logError(
      'Failed to get RPC chainId. Please check if the EL_URL environment variable is correct or try to use another EL.',
    );
    logInfo('Continue work without RPC validation');

    return chainIdCache;
  }
};

export const getChainId = async () => {
  const config = getConfig();
  const deployed = getDeployed();
  const chainId = config.CHAIN_ID;

  if (chainId !== deployed.networkId) {
    throw new Error(
      `ChainId in env and deployed file mismatch. ENV: ${chainId} DEPLOYED: ${deployed.networkId}`,
    );
  }

  // Try to validate chain ID against RPC if EL_URL is provided
  try {
    const elURL = getElUrl();
    const rpcChainId = await getRpcChainId(elURL);
    if (rpcChainId && chainId !== rpcChainId) {
      throw new Error(
        `ChainId in env and RPC chainId mismatch. ENV: ${chainId} RPC: ${rpcChainId}`,
      );
    }
  } catch (error) {
    // If EL_URL is not set, skip RPC validation
    if (error instanceof Error && error.message.includes('EL_URL is not set')) {
      logInfo('EL_URL not set, skipping RPC chain ID validation');
    } else {
      // Re-throw other errors
      throw error;
    }
  }

  return chainId;
};

export const getChain = async (): Promise<Chain> => {
  const chainId = await getChainId();
  const chain = SUPPORTED_CHAINS_LIST.find((chain) => chain.id === chainId);

  if (!chain) {
    throw new Error(`Chain ${chainId} is not supported`);
  }

  return chain;
};

export const getElUrl = (): string => {
  const config = getConfig();
  const elUrls = config.EL_URL as string;

  if (!elUrls) {
    throw new Error(
      'EL_URL is not set. Please set EL_URL in your .env file.\n' +
        'Example: EL_URL=https://your-rpc-endpoint\n' +
        'See documentation for more details: https://lidofinance.github.io/lido-staking-vault-cli/get-started/configuration',
    );
  }

  return elUrls.split(',')[0] as string;
};

export const getContracts = () => {
  const deployedJSON = getDeployed();

  return { ...deployedJSON };
};

export const getContractDeploy = (path: string) => {
  return getValueByPath(getContracts(), path);
};

export const getDeployedAddress = (...contractKeys: string[]) => {
  const contracts = contractKeys.map((contractKey) =>
    getContractDeploy(contractKey),
  );

  const contract = contracts.find((contract) => contract);

  if (typeof contract === 'string') {
    return contract as Address;
  }

  if (!contract || typeof contract !== 'object') {
    throw new Error(`Contracts by ${contractKeys} not found`);
  }

  if (
    'proxy' in contract &&
    typeof contract.proxy === 'object' &&
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    'address' in contract.proxy!
  ) {
    return contract.proxy.address as Address;
  }

  if ('address' in contract) {
    return contract.address as Address;
  }

  throw new Error(`Contracts by ${contractKeys} not found`);
};

export const getOptionalDeployedAddress = (...contractKeys: string[]) => {
  try {
    return getDeployedAddress(...contractKeys);
  } catch {
    return zeroAddress;
  }
};

export const getAddressMap = () => {
  const contracts = getContracts();

  return Object.entries(contracts).reduce(
    (acc, [key, value]) => {
      const name = value?.contract || key;
      const proxy = value?.proxy || (value?.implementation && value?.address);
      const implementation = value?.implementation.address;
      const isNotProxy = !implementation && !proxy;

      if (proxy) {
        acc[proxy.toLowerCase()] = `Proxy (${name})`;
      }

      if (implementation) {
        acc[implementation.toLowerCase()] = `Implementation (${name})`;
      }

      if (isNotProxy && value?.address) {
        acc[value?.address.toLowerCase()] = name;
      }

      return acc;
    },
    {} as Record<string, string>,
  );
};

let addressMapCache: Record<string, string> | undefined;

export const getCachedAddressMap = () => {
  if (!addressMapCache) {
    addressMapCache = getAddressMap();
  }

  return addressMapCache;
};
