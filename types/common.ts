export type ChainOption = { chainId: number };

export interface VaultPayload {
  chainId: number;
  manager: string;
  operator: string;
  quantity: number;
  managementFee: bigint;
  performanceFee: bigint;
}
