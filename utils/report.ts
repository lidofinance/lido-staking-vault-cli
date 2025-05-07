import { Address } from 'viem';

import { BigNumberType, fetchIPFS, IPFS_GATEWAY } from 'utils';

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

export const getVaultReport = async (args: VaultReportArgs) => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;

  const report = await fetchIPFS<Report>({ cid, gateway, bigNumberType });
  const vaultData = getVaultData(report, vault);

  return vaultData;
};

const getVaultData = (report: Report, vault: Address) => {
  const match = report.values.find(
    (entry) => entry.value[0]?.toLowerCase() === vault.toLowerCase(),
  );

  if (!match) throw new Error('Vault not found');

  const leaf = report.tree[match.treeIndex];
  if (!leaf) throw new Error('Leaf not found');

  const data: LeafDataFields = {
    vault_address: '',
    in_out_delta: '',
    fee: '',
    total_value_wei: '',
    liability_shares: '',
  };

  for (const [index, fieldName] of Object.entries(report.leafIndexToData)) {
    const value = match.value[Number(index)];
    if (value === undefined) {
      throw new Error(
        `Missing value at index ${index} for field "${fieldName}"`,
      );
    }
    data[fieldName] = value.toString();
  }

  return {
    data,
    leaf,
    refSlot: report.refSlot,
    blockNumber: report.blockNumber,
    timestamp: report.timestamp,
    proofsCID: report.proofsCID,
    merkleTreeRoot: report.merkleTreeRoot,
    prevTreeCID: report.prevTreeCID,
  };
};

export const getVaultReportProof = async (args: VaultReportArgs) => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;

  const report = await fetchIPFS<Report>({ cid, gateway, bigNumberType });
  const proofCID = report.proofsCID;

  const data = await fetchIPFS<ReportProof>({
    cid: proofCID,
    gateway,
    bigNumberType,
  });

  const proofByVault = data.proofs[vault];
  if (!proofByVault) throw new Error('Proof not found');

  return proofByVault;
};

export const getVaultReportProofByCid = async (args: VaultReportArgs) => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const proof = await fetchIPFS<ReportProof>({ cid, gateway, bigNumberType });

  const proofByVault = proof.proofs[vault];
  if (!proofByVault) throw new Error('Proof not found');

  return proofByVault;
};

export const getAllVaultsReportProofs = async (
  args: Omit<VaultReportArgs, 'vault'>,
) => {
  const { cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const proof = await fetchIPFS<ReportProof>({ cid, gateway, bigNumberType });

  return proof.proofs;
};

export const getAllVaultsReports = async (
  args: Omit<VaultReportArgs, 'vault'>,
) => {
  const { cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const report = await fetchIPFS<Report>({ cid, gateway, bigNumberType });

  const vaultReports = report.values.map(
    (value) => getVaultData(report, value.value[0] as Address).data,
  );

  return { vaultReports, proofsCID: report.proofsCID };
};
