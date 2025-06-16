import { ReadProgramCommandConfig } from 'utils';
import { VaultHubAbi } from 'abi';

export const readCommandConfig: ReadProgramCommandConfig<typeof VaultHubAbi> = {
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
  maxLockableValue: {
    name: 'max-lockable-value',
    description:
      'get the amount of ether that can be locked in the vault given the current total value',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  vaultObligations: {
    name: 'v-obligations',
    description: 'get the obligations struct for the given vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  withdrawableValue: {
    name: 'w-ether',
    description:
      'get the amount of ether that can be instantly withdrawn from the staking vault',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  badDebtToInternalizeAsOfLastRefSlot: {
    name: 'bad-debt',
    description:
      'get the amount of bad debt to be internalized to become the protocol loss',
  },
  inOutDeltaAsOfLastRefSlot: {
    name: 'in-out-delta',
    description: 'get the inOutDelta of the vault as of the last refSlot',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
};
