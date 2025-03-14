import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  VAULT_MASTER_ROLE: {
    name: 'vm-role',
    description: 'get vault master role',
  },
  VAULT_REGISTRY_ROLE: {
    name: 'vr-role',
    description: 'get vault registry role',
  },
  LIDO: {
    name: 'lido',
    description: 'get lido address',
  },
  LIDO_LOCATOR: {
    name: 'll',
    description: 'get lido locator address',
  },
  DEFAULT_ADMIN_ROLE: {
    name: 'dar',
    description: 'get default admin role',
  },
  PAUSE_INFINITELY: {
    name: 'pi',
    description: 'get pause infinitely',
  },
  PAUSE_ROLE: {
    name: 'pr',
    description: 'get pause role',
  },
  RESUME_ROLE: {
    name: 'rr',
    description: 'get resume role',
  },
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
};
