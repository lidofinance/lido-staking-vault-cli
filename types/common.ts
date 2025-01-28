import { Address } from "viem";

export interface VaultWithDelegation {
  defaultAdmin: Address;
  curator: Address;
  minterBurner: Address;
  funderWithdrawer: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeClaimer: Address;
  curatorFeeBP: bigint;
  nodeOperatorFeeBP: bigint;
}

export interface CreateVaultPayload {
  admin: Address;
  curator: Address;
  minterBurner: Address;
  funderWithdrawer: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeClaimer: Address;
  quantity: string;
}

export interface Permit {
  value: bigint;
  deadline: bigint;
  v: number;
  r: Address;
  s: Address;
}
