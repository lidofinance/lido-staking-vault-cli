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
};

export type Report = {
  format: 'standard-v1';
  leafEncoding: ['address', 'uint256', 'uint256', 'uint256', 'uint256'];
  tree: Hex[];
  values: {
    treeIndex: bigint;
    value: [Address, string, string, string, string];
  }[];
  merkleTreeRoot: Hex;
  refSlot: number;
  timestamp: number;
  blockNumber: bigint;
  proofsCID: string;
  prevTreeCID: string;
  leafIndexToData: {
    [key: string]: keyof LeafDataFields;
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
  proofsCID: string;
  prevTreeCID: string;
  merkleTreeRoot: string;
};

export type ReportProof = {
  merkleTreeRoot: string;
  refSlot: number;
  proofs: {
    [key: string]: {
      id: number;
      totalValueWei: bigint;
      inOutDelta: bigint;
      fee: bigint;
      liabilityShares: bigint;
      leaf: string;
      proof: string[];
    };
  };
  block_number: number;
  timestamp: number;
  prevTreeCID: string;
};

export type VaultReportArgs = {
  vault: Address;
  cid: string;
  gateway?: string;
  bigNumberType?: BigNumberType;
};
