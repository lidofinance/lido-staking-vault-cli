import { Address, Hex } from 'viem';

export interface VaultWithDashboard {
  defaultAdmin: Address;
  nodeOperator: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeRate: bigint;
  confirmExpiry: bigint;
}

// TODO: others roles
// export interface CreateVaultPayload {
//   defaultAdmin: Address;
//   nodeOperatorManager: Address;
//   assetRecoverer: Address;
//   confirmExpiry: bigint;
//   funders: Address[];
//   withdrawers: Address[];
//   minters: Address[];
//   burners: Address[];
//   rebalancers: Address[];
//   depositPausers: Address[];
//   depositResumers: Address[];
//   validatorExitRequesters: Address[];
//   validatorWithdrawalTriggerers: Address[];
//   disconnecters: Address[];
//   curatorFeeSetters: Address[];
//   curatorFeeClaimers: Address[];
//   nodeOperatorFeeClaimers: Address[];
// }

export interface Permit {
  value: bigint;
  deadline: bigint;
  v: number;
  r: Address;
  s: Address;
}

export interface RoleAssignment {
  account: Address;
  role: `0x${string}`;
}

export interface Tier {
  operator: Address;
  shareLimit: bigint;
  minDepositAmount: bigint;
  reserveRatioBP: bigint;
  forcedRebalanceThresholdBP: bigint;
  infraFeeBP: bigint;
  liquidityFeeBP: bigint;
  reservationFeeBP: bigint;
}

export type Deposit = {
  pubkey: Hex;
  signature: Hex;
  amount: bigint;
  depositDataRoot: Hex;
};

export type ValidatorTopUp = {
  pubkey: Hex;
  amount: bigint;
};
