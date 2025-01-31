import { Address } from "viem";

export interface VaultWithDelegation {
  defaultAdmin: Address;
  funder: Address;
  withdrawer: Address;
  minter: Address;
  burner: Address;
  rebalancer: Address;
  depositPauser: Address;
  depositResumer: Address;
  exitRequester: Address;
  disconnecter: Address;
  curator: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeClaimer: Address;
  curatorFeeBP: number;
  nodeOperatorFeeBP: number;
}

export interface CreateVaultPayload {
  defaultAdmin: Address;
  funder: Address;
  withdrawer: Address;
  minter: Address;
  burner: Address;
  rebalancer: Address;
  depositPauser: Address;
  depositResumer: Address;
  exitRequester: Address;
  disconnecter: Address;
  curator: Address;
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

export interface RoleAssignment {
  account: Address;
  role: `0x${string}`;
}
