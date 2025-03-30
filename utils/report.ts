import { Address } from 'viem';

export type LeafDataFields = {
  vault_address: string;
  valuation_wei: string;
  in_out_delta: string;
  fee: string;
  shares_minted: string;
};

export type Report = {
  format: string;
  leafEncoding: string[];
  tree: string[];
  values: { value: string[]; treeIndex: number }[];
  merkleTreeRoot: string;
  refSlof: number;
  blockNumber: number;
  proofsCID: string;
  leafIndexToData: {
    [key: string]: keyof LeafDataFields;
  };
};

export type VaultReport = {
  data: LeafDataFields;
  leaf: string;
  refSlof: number;
  blockNumber: number;
  proofsCID: string;
  merkleTreeRoot: string;
};

export type ReportProofData = {
  merkleTreeRoot: string;
  refSlot: number;
  proofs: {
    [key: string]: {
      id: number;
      valuationWei: bigint;
      inOutDelta: bigint;
      fee: bigint;
      sharesMinted: bigint;
      leaf: string;
      proof: string[];
    };
  };
  block_number: number;
};

// TODO: change to the general IPFS gateway
const IPFS_GATEWAY =
  'https://emerald-characteristic-yak-701.mypinata.cloud/ipfs';

export const getReport = async (
  CID: string,
  url = IPFS_GATEWAY,
): Promise<Report> => {
  const ipfsUrl = `${url}/${CID}`;

  console.info('Fetching report from', ipfsUrl);

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS report: ${response.statusText}`);
  }

  const data: Report = await response.json();
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
    valuation_wei: '',
    in_out_delta: '',
    fee: '',
    shares_minted: '',
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
    refSlof: report.refSlof,
    blockNumber: report.blockNumber,
    proofsCID: report.proofsCID,
    merkleTreeRoot: report.merkleTreeRoot,
  };
};

export const getReportProof = async (vault: string, cid: string) => {
  const report = await getReport(cid);
  const proof = report.proofsCID;
  const url = `${IPFS_GATEWAY}/${proof}`;

  console.info('Fetching proof from', url);

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
