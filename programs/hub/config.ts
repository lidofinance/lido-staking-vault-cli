import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  isPaused: {
    name: 'is-paused',
    description: 'get is paused boolean',
  },
  isVaultHealthy: {
    name: 'is-v-h',
    description: 'get is vault healthy boolean',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  vaultsCount: {
    name: 'v-count',
    description: 'get the number of vaults connected to the hub',
  },
  vaultByIndex: {
    name: 'v-by-index',
    description: 'get the vault address by its index',
    arguments: {
      _index: {
        name: 'index',
        description: 'index',
      },
    },
  },
  vaultConnection: {
    name: 'v-connection',
    description: 'get connection parameters struct for the given vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  vaultRecord: {
    name: 'v-record',
    description: 'get the accounting record struct for the given vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  isVaultConnected: {
    name: 'is-v-connected',
    description: 'check if the vault is connected to the hub',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  totalValue: {
    name: 'total-value',
    description:
      'get total value of the vault (as of the latest report received)',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  liabilityShares: {
    name: 'liability-shares',
    description: 'get liability shares of the vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  locked: {
    name: 'locked',
    description: 'get llocked amount of ether for the vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  unlocked: {
    name: 'unlocked',
    description:
      'get amount of ether that is part of the vault`s total value and is not locked as a collateral',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  latestReport: {
    name: 'latest-report-data',
    description: 'get latest report for the vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  latestVaultReportTimestamp: {
    name: 'latest-v-report-ts',
    description: 'get latest report timestamp for the vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  isReportFresh: {
    name: 'is-report-fresh',
    description:
      'check if if the report for the vault is fresh, false otherwise',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  rebalanceShortfall: {
    name: 'rebalance-shortfall',
    description:
      'get amount to rebalance or UINT256_MAX if it`s impossible to make the vault healthy using rebalance',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
};
