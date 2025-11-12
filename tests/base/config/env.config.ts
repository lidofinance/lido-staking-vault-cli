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
  contracts: {
    stake: string;
    wrap: string;
    withdraw: string;
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
      contracts: {
        stake: '0x3508A952176b3c15387C97BE809eaffB1982176a',
        wrap: '0x7E99eE3C66636DE415D2d7C880938F2f40f94De4',
        withdraw: '0xfe56573178f1bcdf53F01A6E9977670dcBBD9186',
      },
    },
  ],
  // mainnnet
]);
