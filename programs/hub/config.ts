import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  calculateVaultTreasuryFees: {
    name: 'calc-t-fee',
    description: 'get calculated vault treasury fees',
    arguments: {
      _reportValuation: {
        name: 'r-val',
        description: 'report valuation',
      },
      _preTotalShares: {
        name: 'pre-t-shares',
        description: 'pre total shares',
      },
      _preTotalPooledEther: {
        name: 'pre-t-pe',
        description: 'pre total pooled ether',
      },
      _postInternalShares: {
        name: 'post-i-shares',
        description: 'post internal shares',
      },
      _postInternalEther: {
        name: 'post-i-ether',
        description: 'post internal ether',
      },
      _sharesToMintAsLidoCoreFees: {
        name: 's-mlc-fees',
        description: 'shares to mint as lido core fees',
      },
    },
  },
  calculateVaultsRebase: {
    name: 'calc-v-rebase',
    description: 'get calculated vaults rebase',
    arguments: {
      vaultsValuations: {
        name: 'v-vals',
        description: 'vaults valuations',
      },
      _preTotalShares: {
        name: 'pre-t-shares',
        description: 'pre total shares',
      },
      _preTotalPooledEther: {
        name: 'pre-t-pe',
        description: 'pre total pooled ether',
      },
      _postInternalShares: {
        name: 'post-i-shares',
        description: 'post internal shares',
      },
      _postInternalEther: {
        name: 'post-i-ether',
        description: 'post internal ether',
      },
      _sharesToMintAsLidoCoreFees: {
        name: 's-mlc-fees',
        description: 'shares to mint as lido core fees',
      },
    },
  },
  isPaused: {
    name: 'is-paused',
    description: 'get is paused boolean',
  },
  isVaultHealthy: {
    name: 'is-v-h',
    description: 'get is vault healthy boolean',
  },
  vaultsCount: {
    name: 'v-count',
    description: 'get connected vaults count',
  },
  vaultSocket: {
    name: 'vault-socket-i',
    description: 'get vault socket by index',
    arguments: {
      _index: {
        name: 'index',
        description: 'index',
      },
    },
  },
  vaultSocket_vault: {
    name: 'vault-socket-v',
    description: 'get vault socket by vault address',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  batchVaultsInfo: {
    name: 'batch-v-info',
    description: 'get batch of vaults info',
    arguments: {
      _offset: {
        name: 'offset',
        description: 'offset of the vault in the batch (indexes start from 0)',
      },
      _limit: {
        name: 'limit',
        description: 'limit of the batch',
      },
    },
  },
  isVaultHealthyAsOfLatestReport: {
    name: 'is-v-healthy-latest-report',
    description:
      'get checks if the vault is healthy by comparing its total value after applying rebalance threshold against current liability shares',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
      },
    },
  },
  latestReportData: {
    name: 'latest-report-data',
    description: 'get latest report data',
  },
};
