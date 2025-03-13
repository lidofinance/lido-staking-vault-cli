import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  withdrawableEther: {
    name: 'w-ether',
    description:
      'get amount of ether that can be withdrawn from the staking vault',
  },
  vaultSocket: {
    name: 'socket',
    description: 'get vault socket',
  },
  vaultHub: {
    name: 'hub',
    description: 'get vaultHub address',
  },
  valuation: {
    name: 'valuation',
    description: 'get vault valuation',
  },
  treasuryFeeBP: {
    name: 't-fee',
    description: 'get treasury fee in basis points',
  },
  totalMintableShares: {
    name: 'total-mintable-shares',
    description: 'get total of shares that can be minted on the vault',
  },
  supportsInterface: {
    name: 'supports-interface',
    description: 'get supports interface by id',
  },
  stakingVault: {
    name: 'vault',
    description: 'get staking vault address',
  },
  sharesMinted: {
    name: 's-minted',
    description: 'get shares minted',
  },
  shareLimit: {
    name: 's-limit',
    description: 'get share limit',
  },
  reserveRatioBP: {
    name: 'reserve-ratio',
    description: 'get reserve ratio in basis points',
  },
  rebalanceThresholdBP: {
    name: 'r-threshold',
    description: 'get rebalance threshold in basis points',
  },
  projectedNewMintableShares: {
    name: 'projected-new-mintable-shares',
    description: 'get projected new mintable shares',
    arguments: {
      _etherToFund: {
        name: 'etherToFund',
        description: 'ether to fund',
      },
    },
  },
  hasRole: {
    name: 'has-role',
    description: 'get has role by role and account',
  },
};
