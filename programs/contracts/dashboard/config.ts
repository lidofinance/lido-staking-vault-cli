import { DashboardAbi } from 'abi';
import { ReadProgramCommandConfig } from 'utils';
import { parseEther } from 'viem';

export const readCommandConfig: ReadProgramCommandConfig<typeof DashboardAbi> =
  {
    withdrawableValue: {
      name: 'w-ether',
      description:
        'get amount of ether that can be withdrawn from the staking vault',
    },
    vaultConnection: {
      name: 'vault-connection',
      description: 'get vault connection',
    },
    VAULT_HUB: {
      name: 'hub',
      description: 'get vaultHub address',
    },
    totalValue: {
      name: 'total-value',
      description: 'get the total value of the vault in ether',
    },
    totalMintingCapacityShares: {
      name: 'total-minting-capacity',
      description:
        'get the overall capacity for stETH shares that can be minted by the vault',
    },
    stakingVault: {
      name: 'vault',
      description: 'get staking vault address',
    },
    liabilityShares: {
      name: 'liability-shares',
      description: 'get the number of stETHshares minted',
    },
    remainingMintingCapacityShares: {
      name: 'remaining-minting-capacity',
      description:
        'get the remaining capacity for stETH shares that can be minted by the vault if additional ether is funded',
      arguments: {
        _etherToFund: {
          name: 'etherToFund',
          description: 'the amount of ether to be funded, can be zero',
          modifier: parseEther,
        },
      },
    },
    locked: {
      name: 'locked',
      description: 'get the locked amount of ether for the vault',
    },
    hasRole: {
      name: 'has-role',
      description: 'get has role by role and account',
    },
    accruedFee: {
      name: 'no-accrued-fee',
      description: 'get the node operator`s accrued fee',
    },
    feeRate: {
      name: 'no-fee-rate',
      description: 'get node operator fee rate in basis points',
    },
    confirmation: {
      name: 'confirmation',
      description:
        'get the confirmation expiry for a given call data and confirmer',
    },
    getConfirmExpiry: {
      name: 'get-confirm-expiry',
      description: 'get the confirmation expiry',
    },
    MAX_CONFIRM_EXPIRY: {
      name: 'MAX_CONFIRM_EXPIRY',
      description: 'get the max confirm expiry',
    },
    MIN_CONFIRM_EXPIRY: {
      name: 'MIN_CONFIRM_EXPIRY',
      description: 'get the min confirm expiry',
    },
    supportsInterface: {
      name: 'supports-interface',
      description: 'get supports interface by id',
    },
    healthShortfallShares: {
      name: 'health-shortfall-shares',
      description:
        'get the amount of shares to rebalance to restore vault healthiness or to cover redemptions',
    },
    minimalReserve: {
      name: 'minimal-reserve',
      description:
        'get the amount of ether that is locked on the vault only as a reserve',
    },
    obligations: {
      name: 'obligations',
      description:
        'get the amount of shares to burn to restore vault healthiness or to cover redemptions and the amount of outstanding Lido fees',
    },
    feeRecipient: {
      name: 'node-operator-fee-recipient',
      description: 'get the address of the node operator fee recipient',
    },
    maxLockableValue: {
      name: 'max-lockable-value',
      description:
        'get the max total lockable amount of ether for the vault (excluding the Lido and node operator fees)',
    },
    latestReport: {
      name: 'latest-report',
      aliases: ['lr'],
      description:
        'get the latest report data containing the total value and in-out delta',
    },
    settledGrowth: {
      name: 'settled-growth',
      description: 'get settled growth of the vault not subject to fees',
    },
    pdgPolicy: {
      name: 'pdg-policy',
      description:
        'get the current active PDG policy set by `DEFAULT_ADMIN_ROLE`',
    },
    latestCorrectionTimestamp: {
      name: 'latest-correction-timestamp',
      description:
        'get the timestamp of the most recent settled growth correction',
    },
    obligationsShortfallValue: {
      name: 'obligations-shortfall-value',
      description:
        'get the amount of ether required to cover obligations shortfall of the vault',
    },
  };
