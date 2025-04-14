import { lstatSync, readFileSync } from 'fs';
import * as process from 'node:process';
import path from 'path';
import { zeroAddress, Address, Chain } from 'viem';

import { getValueByPath, resolvePath, validateConfig, logError } from 'utils';
import { JSONConfig } from 'types';

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

export const importConfigFile = (pathToConfig?: string) => {
  const path = pathToConfig ?? (envs?.CONFIG as string);
  const fullPath = resolvePath(path);

  let json = {} as JSONConfig;

  if (lstatSync(fullPath).isFile()) {
    try {
      const fileContent = readFileSync(fullPath, 'utf-8');
      const config = JSON.parse(fileContent);
      json = structuredClone(config);
    } catch (error) {
      logError(error);
    }
  }

  return json;
};

export const getConfig = (() => {
  const configJSON = importConfigFile();

  const errors = validateConfig(configJSON as unknown as JSONConfig);
  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    errorKeys.forEach((key) =>
      console.error(`${errors[key as keyof JSONConfig]}`),
    );
    process.exit(1);
  }

  return () => configJSON;
})();

export const getDeployed = (() => {
  const deployedJSON = importDeployFile();

  return () => deployedJSON;
})();

export const getChainId = (() => {
  let chainId: number;
  const config = getConfig();
  const deployed = getDeployed();

  if (config) {
    chainId = config.chainId as number;
  } else if (deployed.chainId) {
    chainId = deployed.chainId;
  } else {
    chainId = Number(process.env.CHAIN_ID);
  }

  return () => chainId;
})();

export const getChain = (): Chain => {
  const id = getChainId();
  const chain = SUPPORTED_CHAINS_LIST.find((chain) => chain.id === id);
  return chain ?? (SUPPORTED_CHAINS_LIST[0] as Chain);
};

export const getRpcUrl = (() => {
  let rpcUrls: string;
  const id = getChainId();
  const config = getConfig();

  if (config) {
    rpcUrls = config.rpcLink as string;
  } else {
    rpcUrls = envs?.[`RPC_URL_${id}`] as string;
  }

  return () => rpcUrls.split(',')[0] as string;
})();

export const getContracts = () => {
  const config = getConfig();
  const deployedJSON = getDeployed();

  if (config) {
    const { lidoLocator, accounting } = config;
    return { ...deployedJSON, lidoLocator, accounting };
  }

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
