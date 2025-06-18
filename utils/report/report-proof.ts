import { Address, Hex } from 'viem';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

import { fetchIPFS, fetchIPFSDirect } from 'utils';
import { Report, VaultReportArgs } from './types.js';
import { getVaultData } from './report.js';

export const getReportProofByVault = async (args: VaultReportArgs) => {
  const { vault } = args;

  const IPFSReportData = await fetchIPFSDirect<Report>(args);

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
  const reportData = getVaultData(IPFSReportData, vault);

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
) => {
  const { vaults } = args;

  const proofs = await Promise.all(
    vaults.map((vault) => getReportProofByVault({ ...args, vault })),
  );

  return proofs;
};

export const getReportProofs = async (args: Omit<VaultReportArgs, 'vault'>) => {
  const report = await fetchIPFS<Report>(args);
  const vaultReports = report.values.map(
    (value) => getVaultData(report, value.value[0]).data,
  );
  const vaults = vaultReports.map((vault) => vault.vault_address);

  const proofs = await Promise.all(
    vaults.map((vault) =>
      getReportProofByVault({ ...args, vault: vault as Address }),
    ),
  );

  return proofs;
};
