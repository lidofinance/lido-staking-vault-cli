import { DistributorAbi } from 'abi/defi-wrapper/index.js';
import { ReadProgramCommandConfig, stringToAddress } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof DistributorAbi
> = {
  cid: {
    name: 'cid',
    description: 'get IPFS CID of the last published Merkle tree',
  },
  claimed: {
    name: 'claimed',
    description: 'get claimed amounts by account and token',
    arguments: {
      account: {
        name: 'account',
        description: 'account address',
        modifier: stringToAddress,
      },
      token: {
        name: 'token',
        description: 'token address',
        modifier: stringToAddress,
      },
    },
  },
  getTokens: {
    name: 'get-tokens',
    description: 'get the list of supported tokens',
  },
  lastProcessedBlock: {
    name: 'last-processed-block',
    description: 'get the last processed block number for user tracking',
  },
  root: {
    name: 'root',
    description: 'get the Merkle root of the distribution',
  },
  MANAGER_ROLE: {
    name: 'MANAGER_ROLE',
    description: 'get the manager role',
  },
  DEFAULT_ADMIN_ROLE: {
    name: 'DEFAULT_ADMIN_ROLE',
    description: 'get the default admin role',
  },
};
