import { Address, Hex } from 'viem';

type BigNumberType = 'bigint' | 'string';

export type LeafDataFields = {
  vaultAddress: string;
  totalValueWei: string;
  fee: string;
  liabilityShares: string;
  slashingReserve: string;
};

export type ExtraDataFields = {
  inOutDelta: string;
  prevFee: string;
  infraFee: string;
  liquidityFee: string;
  reservationFee: string;
};

export type Report = {
  format: 'standard-v1';
  leafEncoding: ['address', 'uint256', 'uint256', 'uint256', 'uint256'];
  tree: Hex[];
  values: {
    treeIndex: bigint;
    value: [Address, string, string, string, string];
  }[];
  refSlot: number;
  timestamp: number;
  blockNumber: bigint;
  prevTreeCID: string;
  leafIndexToData: {
    [key: string]: keyof LeafDataFields | number;
  };
  extraValues: {
    [key: string]: ExtraDataFields;
  };
};

export type VaultReport = {
  data: LeafDataFields;
  extraData: ExtraDataFields;
  leaf: string;
  refSlot: number;
  blockNumber: number;
  timestamp: number;
  prevTreeCID: string;
};

export type VaultReportArgs = {
  vault: Address;
  cid: string;
  gateway?: string;
  bigNumberType?: BigNumberType;
};
