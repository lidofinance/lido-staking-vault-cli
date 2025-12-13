import {
  NetworkConfig,
  NETWORKS_CONFIG,
} from '@lidofinance/wallets-testing-wallets';
import { ENV_CONFIG } from './env.validation';
import { Address, Chain } from 'viem';
import { SUPPORTED_CHAINS_LIST } from './constants';
import { EthereumNodeServiceOptions } from '@lidofinance/wallets-testing-nodes';

export const getChain = (): Chain => {
  const chainId = getStandConfig().networkConfig.chainId;
  const chain = SUPPORTED_CHAINS_LIST.find((chain) => chain.id === chainId);

  if (!chain) {
    throw new Error(`Chain ${chainId} is not supported`);
  }

  return chain;
};

export const getStandConfig = (): StandConfig => {
  const config = STAND_CONFIGS.get(ENV_CONFIG.CHAIN_ID);

  if (!config) {
    throw new Error(
      `CONFIG_VALIDATION_ERROR: CHAIN_ID is not correctly defined (value is "${ENV_CONFIG.CHAIN_ID}"). Please fix it in the .env file.`,
    );
  }

  return config;
};

export const getElUrl = () => {
  const config = getStandConfig();
  return `http://${config.nodeConfig.host}:${config.nodeConfig.port}`;
};

export interface StandConfig {
  networkConfig: NetworkConfig;
  deployed: string;
  contracts: { operatorGrid: Address; lidoLocator: Address };
  nodeConfig: EthereumNodeServiceOptions & {
    host: string;
  };
}

export const STAND_ENV = {
  hoodiTestnet: '560048',
};

export const STAND_CONFIGS = new Map<string, StandConfig>([
  [
    STAND_ENV.hoodiTestnet,
    {
      deployed: 'deployed-hoodi-vaults.json',
      networkConfig: {
        ...NETWORKS_CONFIG.testnet.ETHEREUM_HOODI,
        rpcUrl: process.env.RPC_URL
          ? process.env.RPC_URL
          : NETWORKS_CONFIG.testnet.ETHEREUM_HOODI.rpcUrl,
      },
      nodeConfig: {
        rpcUrlToMock: `**/api/rpc?chainId=560048`,
        rpcUrl: process.env.RPC_URL as string,
        host: '127.0.0.1',
        port: 8545,
      },
      contracts: {
        operatorGrid: '0x501e678182bB5dF3f733281521D3f3D1aDe69917',
        lidoLocator: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',
      },
    },
  ],
  // mainnet
]);
