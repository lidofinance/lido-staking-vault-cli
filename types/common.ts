import { Address } from "viem";

export interface VaultPayload {
  curator: Address;
  staker: Address;
  tokenMaster: Address;
  operator: Address;
  claimOperatorDueRole: Address;
  curatorFee: bigint;
  operatorFee: bigint;
}

export interface CreateVaultPayload {
  curator: Address;
  operator: Address;
  staker: Address;
  tokenMaster: Address;
  claimOperatorDue: Address;
  quantity: string;
}

export interface Permit {
  value: bigint;
  deadline: bigint;
  v: number;
  r: Address;
  s: Address;
}
