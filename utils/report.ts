import { Address } from 'viem';

import { logInfo, fetchIPFS, IPFS_GATEWAY } from 'utils';

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
  refSlof: number;
  blockNumber: number;
  timestamp: number;
  proofsCID: string;
  prevTreeCID: string;
  merkleTreeRoot: string;
};

export type ReportProofData = {
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

export const getReport = async (
  CID: string,
  url = IPFS_GATEWAY,
): Promise<Report> => {
  const data: Report = await fetchIPFS(CID, url);

  return data;
};

export const getVaultReport = async (
  vault: Address,
  cid: string,
  url = IPFS_GATEWAY,
): Promise<VaultReport> => {
  const report = await getReport(cid, url);
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
    refSlof: report.refSlot,
    blockNumber: report.blockNumber,
    timestamp: report.timestamp,
    proofsCID: report.proofsCID,
    merkleTreeRoot: report.merkleTreeRoot,
    prevTreeCID: report.prevTreeCID,
  };
};

export const getReportProof = async (vault: string, cid: string) => {
  const report = await getReport(cid);
  const proof = report.proofsCID;
  const url = `${IPFS_GATEWAY}/${proof}`;

  logInfo('Fetching proof from', url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS proof: ${response.statusText}`);
  }

  const data: ReportProofData = await response.json();
  const proofByVault = data.proofs[vault];
  if (!proofByVault) throw new Error('Proof not found');

  return proofByVault;
};

export const getAllVaultsReports = async (
  CID: string,
  url = IPFS_GATEWAY,
): Promise<VaultReport['data'][]> => {
  const report = await getReport(CID, url);

  const vaultReports = report.values.map(
    (value) => getVaultData(report, value.value[0] as Address).data,
  );

  return vaultReports;
};
