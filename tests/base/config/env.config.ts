import {
  NetworkConfig,
  NETWORKS_CONFIG,
} from '@lidofinance/wallets-testing-wallets';
import { ENV_CONFIG } from './env.validation';

export const getStandConfig = (): StandConfig => {
  const config = STAND_CONFIGS.get(ENV_CONFIG.CHAIN_ID);

  if (!config) {
    throw new Error(
      `CONFIG_VALIDATION_ERROR: CHAIN_ID is not correctly defined (value is "${ENV_CONFIG.CHAIN_ID}"). Please fix it in the .env file.`,
    );
  }

  return config;
};

export interface StandConfig {
  networkConfig: NetworkConfig;
  deployed: string;
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
    },
  ],
  // mainnnet
]);
