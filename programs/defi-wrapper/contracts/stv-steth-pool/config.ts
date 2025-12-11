import { StvStETHPoolAbi } from 'abi/defi-wrapper/index.js';
import {
  ReadProgramCommandConfig,
  stringToAddress,
  stringToBigInt,
} from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof StvStETHPoolAbi
> = {
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
  calcAssetsToLockForStethShares: {
    name: 'calc-assets-to-lock-for-steth-shares',
    description:
      'get calculated the min amount of assets to lock for a given amount of stETH shares',
    arguments: {
      _stethShares: {
        name: 'stethShares',
        description: 'the amount of stETH shares (18 decimals)',
        modifier: stringToBigInt,
      },
    },
  },
  calcStethSharesToMintForAssets: {
    name: 'calc-steth-shares-to-mint-for-assets',
    description:
      'get calculated the amount of stETH shares to mint for a given amount of assets',
    arguments: {
      _assets: {
        name: 'assets',
        description: 'the amount of assets (18 decimals)',
        modifier: stringToBigInt,
      },
    },
  },
  calcStethSharesToMintForStv: {
    name: 'calc-steth-shares-to-mint-for-stv',
    description:
      'get calculated amount of stETH shares to mint for a given amount of stv',
    arguments: {
      _stv: {
        name: 'stv',
        description: 'the amount of stv (27 decimals)',
        modifier: stringToBigInt,
      },
    },
  },
  calcStvToLockForStethShares: {
    name: 'calc-stv-to-lock-for-steth-shares',
    description:
      'get calculated min amount of stv to lock for a given amount of stETH shares',
    arguments: {
      _stethShares: {
        name: 'stethShares',
        description: 'the amount of stETH shares (18 decimals)',
        modifier: stringToBigInt,
      },
    },
  },
  totalMintedStethShares: {
    name: 'total-minted-steth-shares',
    description: 'get the total stETH shares minted by the pool',
  },
  mintedStethSharesOf: {
    name: 'minted-steth-shares-of',
    description:
      'get the amount of stETH shares minted by the pool for a specific account',
    arguments: {
      _account: {
        name: 'account',
        description: 'the address of the account',
        modifier: stringToAddress,
      },
    },
  },
  totalExceedingMintedStethShares: {
    name: 'total-exceeding-minted-steth-shares',
    description:
      "get the amount of minted stETH shares exceeding the Staking Vault's liability",
  },
};
