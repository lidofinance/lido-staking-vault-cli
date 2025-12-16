import { Address, Hex } from 'viem';

export type RoleAssignment = {
  account: string;
  role: Address;
};

export type CreateVaultParams = {
  defaultAdmin: string;
  nodeOperator: string;
  nodeOperatorManager: string;
  confirmExpiry: number;
  nodeOperatorFeeRate: number;
  privateKey: string;
  quantity?: number;
  roles?: RoleAssignment[];
  deployedFile?: string;
};

export type VaultCreationResult = {
  vaultAddress: Address;
  dashboardAddress: Address;
  txHash: Hex;
};

export type VaultInfo = {
  nodeOperator: string;
  tierId: number;
  shareLimit: bigint;
  reserveRatioBP: bigint;
  forcedRebalanceThresholdBP: bigint;
  infraFeeBP: bigint;
  liquidityFeeBP: bigint;
  reservationFeeBP: bigint;
};

export type OperatorGroupInfo = {
  shareLimit: bigint;
  liabilityShares: bigint;
  tierIds: number[];
};

export type DashboardOverview = {
  healthFactor: string;
  reserveRatioPercent: string;
  forceRebalanceThreshold: string;
  stVaultShareLimitSteth: string;
  stVaultShareLimitShares: string;
  nodeOperatorFeeRatePercent: string;
  utilizationRatioPercent: string;
  totalValueEth: string;
  liabilitySteth: string;
  liabilityShares: string;
  availableToWithdrawalEth: string;
  idleCapitalEth: string;
  lockedEth: string;
  totalLockedEth: string;
  collateralEth: string;
  recentlyRepaidEth: string;
  nodeOperatorAccruedFeeEth: string;
  reservedEth: string;
  settledGrowthEth: string;
  totalMintingCapacityShares: string;
  totalMintingCapacitySteth: string;
  remainingMintingCapacitySteth: string;
  remainingMintingCapacityShares: string;
  unsettledLidoFeesEth: string;
  sharesToBurnShares: string;
  tierId: number;
  tierShareLimitSteth: string;
  tierShareLimitShares: string;
  groupShareLimitSteth: string | null;
  groupShareLimitShares: string | null;
};

export type PDGInfo = {
  CONTRACT_ADDRESS: Address;
  DEFAULT_ADMIN_ROLE: Address;
  RESUME_ROLE: Address;
  PAUSE_ROLE: Address;
  BEACON_ROOTS: Address;
  GI_FIRST_VALIDATOR_CURR: bigint;
  GI_FIRST_VALIDATOR_PREV: bigint;
  GI_PUBKEY_WC_PARENT: bigint;
  GI_STATE_ROOT: string;
  MAX_SUPPORTED_WC_VERSION: number;
  MIN_SUPPORTED_WC_VERSION: number;
  PREDEPOSIT_AMOUNT: bigint;
  PIVOT_SLOT: bigint;
  isPaused: boolean;
  resumeSinceTimestamp: bigint;
};
