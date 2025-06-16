import { Address } from 'viem';

import { fetchIPFS, IPFS_GATEWAY, logInfo } from 'utils';

import type {
  VaultReport,
  VaultReportArgs,
  Report,
  ReportProof,
  LeafDataFields,
} from './types.js';

export const getVaultReport = async (
  args: VaultReportArgs,
  cache = true,
): Promise<VaultReport> => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;

  const report = await fetchIPFS<Report>(
    {
      cid,
      gateway,
      bigNumberType,
    },
    cache,
  );
  const vaultData = getVaultData(report, vault);

  return vaultData;
};

export const getVaultPreviousReport = async (
  args: VaultReportArgs,
  cache = true,
): Promise<VaultReport> => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const report = await fetchIPFS<Report>(
    {
      cid,
      gateway,
      bigNumberType,
    },
    cache,
  );

  const previousReportCID = report.prevTreeCID;
  const previousReport = await fetchIPFS<Report>({
    cid: previousReportCID,
    gateway,
    bigNumberType,
  });
  const vaultData = getVaultData(previousReport, vault);

  return vaultData;
};

const getVaultData = (report: Report, vault: Address): VaultReport => {
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

export const getVaultReportProof = async (
  args: VaultReportArgs,
  cache = true,
) => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;

  const report = await fetchIPFS<Report>(
    {
      cid,
      gateway,
      bigNumberType,
    },
    cache,
  );
  const proofCID = report.proofsCID;

  const data = await fetchIPFS<ReportProof>(
    {
      cid: proofCID,
      gateway,
      bigNumberType,
    },
    cache,
  );

  const proofByVault = data.proofs[vault];
  if (!proofByVault) throw new Error('Proof not found');

  return proofByVault;
};

export const getVaultReportProofByCid = async (
  args: VaultReportArgs,
  cache = true,
) => {
  const { vault, cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const proof = await fetchIPFS<ReportProof>(
    {
      cid,
      gateway,
      bigNumberType,
    },
    cache,
  );

  const proofByVault = proof.proofs[vault];
  if (!proofByVault) throw new Error('Proof not found');

  return proofByVault;
};

export const getAllVaultsReportProofs = async (
  args: Omit<VaultReportArgs, 'vault'>,
  cache = true,
) => {
  const { cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const proof = await fetchIPFS<ReportProof>(
    {
      cid,
      gateway,
      bigNumberType,
    },
    cache,
  );

  return proof.proofs;
};

export const getAllVaultsReports = async (
  args: Omit<VaultReportArgs, 'vault'>,
  cache = true,
) => {
  const { cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const report = await fetchIPFS<Report>(
    {
      cid,
      gateway,
      bigNumberType,
    },
    cache,
  );

  const vaultReports = report.values.map(
    (value) => getVaultData(report, value.value[0] as Address).data,
  );

  return {
    vaultReports,
    proofsCID: report.proofsCID,
    prevTreeCID: report.prevTreeCID,
  };
};

/**
 * Retrieves a chain of historical VaultReport entries using prevTreeCID, starting from the specified CID.
 * @param args { vault, cid, gateway, bigNumberType, limit, direction }
 * @returns Promise<VaultReport[]> — array from newest to oldest (default) or oldest to newest (if direction === 'asc')
 */
export const getVaultReportHistory = async (
  args: VaultReportArgs & { limit?: number; direction?: 'asc' | 'desc' },
  cache = true,
): Promise<VaultReport[]> => {
  const {
    vault,
    gateway = IPFS_GATEWAY,
    bigNumberType = 'string',
    direction = 'desc',
  } = args;
  let cid = args.cid;
  const limit = args.limit ?? 20;
  const history: VaultReport[] = [];
  for (let i = 0; i < limit; i++) {
    try {
      const report = await getVaultReport(
        {
          vault,
          cid,
          gateway,
          bigNumberType,
        },
        cache,
      );
      history.push(report);
      if (!report.prevTreeCID || report.prevTreeCID === cid) break;
      cid = report.prevTreeCID;
    } catch (e) {
      break;
    }
  }

  logInfo('Report hostory cached', history.length);
  if (direction === 'asc') {
    return history.reverse();
  }

  return history;
};
