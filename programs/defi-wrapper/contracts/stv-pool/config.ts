import { StvPoolAbi } from 'abi/defi-wrapper/index.js';
import {
  ReadProgramCommandConfig,
  stringToAddress,
  stringToBigInt,
} from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<typeof StvPoolAbi> = {
  totalUnassignedLiabilityShares: {
    name: 'total-unassigned-liability-shares',
    aliases: ['tul-shares'],
    description:
      'get the total liability stETH shares that are not assigned to any users',
  },
  totalUnassignedLiabilitySteth: {
    name: 'total-unassigned-liability-steth',
    aliases: ['tul-steth'],
    description: 'get the total unassigned liability in stETH',
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
  totalNominalAssets: {
    name: 'total-nominal-assets',
    aliases: ['tna'],
    description: 'get the total nominal assets managed by the pool',
  },
  isAllowListed: {
    name: 'is-allow-listed',
    description: 'get whether the address is allow listed',
    arguments: {
      _user: {
        name: 'user',
        description: 'the address to check',
        modifier: stringToAddress,
      },
    },
  },
};
