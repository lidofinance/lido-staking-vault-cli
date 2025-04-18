import { Address } from 'viem';

export interface VaultWithDelegation {
  defaultAdmin: Address;
  nodeOperatorManager: Address;
  assetRecoverer: Address;
  confirmExpiry: bigint;
  curatorFeeBP: number;
  nodeOperatorFeeBP: number;
  funders: Address[];
  withdrawers: Address[];
  minters: Address[];
  burners: Address[];
  rebalancers: Address[];
  depositPausers: Address[];
  depositResumers: Address[];
  validatorExitRequesters: Address[];
  validatorWithdrawalTriggerers: Address[];
  disconnecters: Address[];
  curatorFeeSetters: Address[];
  curatorFeeClaimers: Address[];
  nodeOperatorFeeClaimers: Address[];
}

export interface CreateVaultPayload {
  defaultAdmin: Address;
  nodeOperatorManager: Address;
  assetRecoverer: Address;
  confirmExpiry: bigint;
  funders: Address[];
  withdrawers: Address[];
  minters: Address[];
  burners: Address[];
  rebalancers: Address[];
  depositPausers: Address[];
  depositResumers: Address[];
  validatorExitRequesters: Address[];
  validatorWithdrawalTriggerers: Address[];
  disconnecters: Address[];
  curatorFeeSetters: Address[];
  curatorFeeClaimers: Address[];
  nodeOperatorFeeClaimers: Address[];
}

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
  shareLimit: bigint;
  reserveRatioBP: bigint;
  rebalanceThresholdBP: bigint;
  treasuryFeeBP: bigint;
}
