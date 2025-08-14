import { Address, Hex } from 'viem';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

import { fetchIPFS } from 'utils';
import { Report, VaultReportArgs } from './types.js';
import { getVaultData } from './report.js';

export const getReportProofByVault = async (
  args: VaultReportArgs,
  cache = true,
) => {
  const { vault } = args;

  const IPFSReportData = await fetchIPFS<Report>(args, cache);

  const merkleTree = StandardMerkleTree.load({
    ...IPFSReportData,
    values: IPFSReportData.values.map(({ treeIndex, value }) => {
      return {
        value,
        treeIndex: Number(treeIndex),
      };
    }),
  });

  const vaultIndex = IPFSReportData.values.findIndex(
    ({ value }) => value[0].toLowerCase() === vault.toLowerCase(),
  );

  if (vaultIndex < 0) {
    throw new Error(`Vault ${vault} not found in report`);
  }
  const reportData = getVaultData(IPFSReportData, vault, args.cid);

  return {
    ...reportData,
    proof: merkleTree.getProof(vaultIndex) as Hex[],
  };
};

type GetReportProofByVaultsArgs = Omit<VaultReportArgs, 'vault'> & {
  vaults: Address[];
};

export const getReportProofByVaults = async (
  args: GetReportProofByVaultsArgs,
  cache = true,
) => {
  const { vaults } = args;

  const proofs = await Promise.all(
    vaults.map((vault) => getReportProofByVault({ ...args, vault }, cache)),
  );

  return proofs;
};

export const getReportProofs = async (
  args: Omit<VaultReportArgs, 'vault'>,
  cache = true,
) => {
  const report = await fetchIPFS<Report>(args, cache);
  const vaultReports = report.values.map(
    (value) => getVaultData(report, value.value[0], args.cid).data,
  );
  const vaults = vaultReports.map((vault) => vault.vaultAddress);

  const proofs = await Promise.all(
    vaults.map((vault) =>
      getReportProofByVault({ ...args, vault: vault as Address }, cache),
    ),
  );

  return proofs;
};
