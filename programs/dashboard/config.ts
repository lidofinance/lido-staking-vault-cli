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
  totalValue: {
    name: 'total-value',
    description: 'get the total value of the vault in ether',
  },
  treasuryFeeBP: {
    name: 't-fee',
    description: 'get treasury fee in basis points',
  },
  totalMintingCapacity: {
    name: 'total-mintable-capacity',
    description:
      'get the overall capacity for stETH shares that can be minted by the vault',
  },
  supportsInterface: {
    name: 'supports-interface',
    description: 'get supports interface by id',
  },
  stakingVault: {
    name: 'vault',
    description: 'get staking vault address',
  },
  liabilityShares: {
    name: 'liability-shares',
    description: 'get the number of stETHshares minted',
  },
  shareLimit: {
    name: 's-limit',
    description: 'get share limit',
  },
  reserveRatioBP: {
    name: 'reserve-ratio',
    description: 'get reserve ratio in basis points',
  },
  forcedRebalanceThresholdBP: {
    name: 'force-rebalance-threshold',
    description: 'get the rebalance threshold of the vault in basis points',
  },
  remainingMintingCapacity: {
    name: 'remaining-minting-capacity',
    description:
      'get the remaining capacity for stETH shares that can be minted by the vault if additional ether is funded',
    arguments: {
      _etherToFund: {
        name: 'etherToFund',
        description: 'the amount of ether to be funded, can be zero',
      },
    },
  },
  unreserved: {
    name: 'unreserved',
    description: 'get the unreserved amount of ether',
  },
  hasRole: {
    name: 'has-role',
    description: 'get has role by role and account',
  },
  nodeOperatorUnclaimedFee: {
    name: 'no-unclaimed-fee',
    description: `returns the accumulated unclaimed node operator fee in ether`,
  },
  nodeOperatorFeeClaimedReport: {
    name: 'no-fee-report',
    description: 'get node operator fee claimed report',
  },
  nodeOperatorFeeBP: {
    name: 'no-fee',
    description: 'get node operator fee in basis points',
  },
  accruedRewardsAdjustment: {
    name: 'accrued-rewards-adjustment',
    description:
      'get adjustment to allow fee correction during side deposits or consolidations.',
  },
  confirmations: {
    name: 'confirmations',
    description: 'get tracks confirmations',
  },
  confirmingRoles: {
    name: 'confirming-roles',
    description: 'get confirming roles',
  },
  getConfirmExpiry: {
    name: 'get-confirm-expiry',
    description: 'get the confirmation expiry',
  },
  MANUAL_ACCRUED_REWARDS_ADJUSTMENT_LIMIT: {
    name: 'manual-accrued-rewards-adjustment-limit',
    description: 'get the manual accrued rewards adjustment limit',
  },
  MAX_CONFIRM_EXPIRY: {
    name: 'max-confirm-expiry',
    description: 'get the max confirm expiry',
  },
  MIN_CONFIRM_EXPIRY: {
    name: 'min-confirm-expiry',
    description: 'get the min confirm expiry',
  },
};
