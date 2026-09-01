import {
  NetworkConfig,
  NETWORKS_CONFIG,
} from '@lidofinance/wallets-testing-wallets';
import { ENV_CONFIG } from './env.validation';
import { Address, Chain } from 'viem';
import { SUPPORTED_CHAINS_LIST } from './constants';
import { EthereumNodeServiceOptions } from '@lidofinance/wallets-testing-nodes';
import {
  TESTNET_VOTE_DATA,
  MAINNET_VOTE_DATA,
} from '../tempDelete/voteCreationData';

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
  contracts: {
    operatorGrid: Address;
    lidoLocator: Address;
    //
    aragonTokenManager: Address;
    aragonVoting: Address;
    ldoContract: Address;
    dgEmergencyProtectedTimeLockContract: Address;
    dualGovernanceContract: Address;
  };
  voteCreationData: string;
  nodeConfig: EthereumNodeServiceOptions & {
    host: string;
  };
}

export const STAND_ENV = {
  hoodiTestnet: '560048',
  mainnet: '1',
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
        rpcUrlToMock: `**/api/rpc?chainId=560048`, // not required
        rpcUrl: process.env.RPC_URL as string,
        host: '127.0.0.1',
        port: 8545,
      },
      contracts: {
        operatorGrid: '0x501e678182bB5dF3f733281521D3f3D1aDe69917',
        lidoLocator: '0xe2EF9536DAAAEBFf5b1c130957AB3E80056b06D8',

        //
        ldoContract: '0xEf2573966D009CcEA0Fc74451dee2193564198dc',
        aragonTokenManager: '0x8ab4a56721Ad8e68c6Ad86F9D9929782A78E39E5',
        aragonVoting: '0x49B3512c44891bef83F8967d075121Bd1b07a01B',
        dgEmergencyProtectedTimeLockContract:
          '0x0A5E22782C0Bd4AddF10D771f0bF0406B038282d',
        dualGovernanceContract: '0x9CAaCCc62c66d817CC59c44780D1b722359795bF',
      },
      voteCreationData: TESTNET_VOTE_DATA,
    },
  ],
  [
    STAND_ENV.mainnet,
    {
      deployed: 'deployed-mainnet-vaults.json',
      networkConfig: {
        ...NETWORKS_CONFIG.mainnet.ETHEREUM,
        rpcUrl: process.env.RPC_URL
          ? process.env.RPC_URL
          : NETWORKS_CONFIG.mainnet.ETHEREUM.rpcUrl,
      },
      nodeConfig: {
        rpcUrlToMock: `**/api/rpc?chainId=1`,
        rpcUrl: process.env.RPC_URL as string,
        host: '127.0.0.1',
        port: 8545,
      },
      contracts: {
        operatorGrid: '0xC69685E89Cefc327b43B7234AC646451B27c544d',
        lidoLocator: '0xC1d0b3DE6792Bf6b4b37EccdcC24e45978Cfd2Eb',
        //
        ldoContract: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
        aragonTokenManager: '0xf73a1260d222f447210581DDf212D915c09a3249',
        aragonVoting: '0x2e59A20f205bB85a89C53f1936454680651E618e',
        dgEmergencyProtectedTimeLockContract:
          '0xCE0425301C85c5Ea2A0873A2dEe44d78E02D2316',
        dualGovernanceContract: '0xC1db28B3301331277e307FDCfF8DE28242A4486E',
      },
      voteCreationData: MAINNET_VOTE_DATA,
    },
  ],
]);
