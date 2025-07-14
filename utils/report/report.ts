import { Address } from 'viem';

import { fetchIPFS, IPFS_GATEWAY, logInfo, snakeToCamel } from 'utils';

import type {
  VaultReport,
  VaultReportArgs,
  Report,
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

export const getVaultData = (report: Report, vault: Address): VaultReport => {
  const match = report.values.find(
    (entry) => entry.value[0]?.toLowerCase() === vault.toLowerCase(),
  );

  if (!match) throw new Error('Vault not found');

  const leaf = report.tree[Number(match.treeIndex)];
  if (!leaf) throw new Error('Leaf not found');

  const data: LeafDataFields = {
    vaultAddress: '',
    fee: '',
    totalValueWei: '',
    liabilityShares: '',
    slashingReserve: '',
  };

  // TODO: for old reports without extraValues
  const extraData = report.extraValues?.[vault] || { inOutDelta: '0' };

  for (const [_key, _index] of Object.entries(report.leafIndexToData)) {
    let index: number;
    let fieldName: string;

    // new report format
    // leafIndexToData: { "vaultAddress": 0, ...
    if (typeof _index === 'number') {
      index = _index;
      fieldName = _key;
    }
    // old report format
    // leafIndexToData: { "0": "vaultAddress", ...
    else {
      index = Number(_key);
      fieldName = _index;
    }

    const valueByIndex = match.value[index];
    if (valueByIndex === undefined) {
      throw new Error(
        `Missing value at index ${index} for field "${fieldName}"`,
      );
    }
    const camelCaseFieldName = snakeToCamel(fieldName) as keyof LeafDataFields;
    data[camelCaseFieldName] = valueByIndex.toString();
  }

  return {
    data,
    extraData,
    leaf,
    refSlot: report.refSlot,
    blockNumber: Number(report.blockNumber),
    timestamp: report.timestamp,
    prevTreeCID: report.prevTreeCID,
  };
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
    (value) => getVaultData(report, value.value[0]).data,
  );

  return {
    vaultReports,
    prevTreeCID: report.prevTreeCID,
  };
};

/**
 * Retrieves a chain of historical VaultReport entries using prevTreeCID, starting from the specified CID.
 * @param args { vault, cid, gateway, bigNumberType, limit, direction }
 * @returns Promise<VaultReport[]> — array from newest to oldest (default) or oldest to newest (if direction === 'asc')
 */
export const getVaultReportHistory = async (
  args: VaultReportArgs & {
    limit?: number;
    direction?: 'asc' | 'desc';
    minTimestamp?: number;
  },
  cache = true,
): Promise<VaultReport[]> => {
  const {
    vault,
    gateway = IPFS_GATEWAY,
    bigNumberType = 'string',
    direction = 'desc',
    minTimestamp,
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
      if (minTimestamp && report.timestamp < minTimestamp) {
        break;
      }
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
