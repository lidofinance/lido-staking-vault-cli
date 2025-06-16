import { Address } from 'viem';

type BigNumberType = 'bigint' | 'string';

export type LeafDataFields = {
  vault_address: string;
  total_value_wei: string;
  in_out_delta: string;
  fee: string;
  liability_shares: string;
};

export type Report = {
  format: string;
  leafEncoding: string[];
  tree: string[];
  values: { value: string[]; treeIndex: number }[];
  merkleTreeRoot: string;
  refSlot: number;
  timestamp: number;
  blockNumber: number;
  proofsCID: string;
  prevTreeCID: string;
  leafIndexToData: {
    [key: string]: keyof LeafDataFields;
  };
};

export type VaultReport = {
  data: LeafDataFields;
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
