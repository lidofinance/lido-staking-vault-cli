import { StvPoolAbi } from 'abi/defi-wrapper/index.js';
import {
  ReadProgramCommandConfig,
  stringToAddress,
  stringToBigInt,
} from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<typeof StvPoolAbi> = {
  withdrawableStvOf: {
    name: 'withdrawable-stv-of',
    description:
      'get calculated amount of stv that can be withdrawn by an account',
    arguments: {
      _account: {
        name: 'account',
        description: 'the address of the account',
        modifier: stringToAddress,
      },
    },
  },
  withdrawableEthOf: {
    name: 'withdrawable-eth-of',
    description:
      'get calculated the amount of ETH that can be withdrawn by an account',
    arguments: {
      _account: {
        name: 'account',
        description: 'the address of the account',
        modifier: stringToAddress,
      },
    },
  },
  vaultDisconnected: {
    name: 'vault-disconnected',
    description: 'get whether the vault is disconnected',
  },
  totalUnassignedLiabilityShares: {
    name: 'total-unassigned-liability-shares',
    aliases: ['tuls'],
    description:
      'get the total liability stETH shares that are not assigned to any users',
  },
  totalAssets: {
    name: 'total-assets',
    aliases: ['ta'],
    description: 'get the total assets managed by the pool',
  },
  totalLiabilityShares: {
    name: 'total-liability-shares',
    aliases: ['tls'],
    description: 'get the total liability stETH shares issued to the vault',
  },
  totalExceedingMintedSteth: {
    name: 'total-exceeding-minted-steth',
    aliases: ['tems'],
    description:
      "get the amount of minted stETH exceeding the Staking Vault's liability",
  },
  previewWithdraw: {
    name: 'preview-withdraw',
    description:
      'get preview the amount of stv that would be burned for a given asset withdrawal',
    arguments: {
      _assets: {
        name: 'assets',
        description: 'the amount of assets to withdraw (18 decimals)',
        modifier: stringToBigInt,
      },
    },
  },
  previewRedeem: {
    name: 'preview-redeem',
    description:
      'get preview the amount of assets that would be received for a given stv amount',
    arguments: {
      _stv: {
        name: 'stv',
        description: 'the amount of stv to redeem (27 decimals)',
        modifier: stringToBigInt,
      },
    },
  },
  previewDeposit: {
    name: 'preview-deposit',
    description:
      'get preview the amount of stv that would be received for a given asset amount',
    arguments: {
      _assets: {
        name: 'assets',
        description: 'the amount of assets to deposit (18 decimals)',
        modifier: stringToBigInt,
      },
    },
  },
};
