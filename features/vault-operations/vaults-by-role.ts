import { getStakingVaultContract, getVaultViewerContract } from 'contracts';
import { callReadMethodSilent, selectPrompt } from 'utils';
import { getAccount } from 'providers';

export const getVaultsByOwner = async () => {
  const contract = getVaultViewerContract();
  const account = await getAccount();

  const vaults = await callReadMethodSilent(contract, 'vaultsByOwner', [
    account.address,
  ]);

  return vaults;
};

export const getVaultsByNO = async () => {
  const account = await getAccount();
  const contract = getVaultViewerContract();
  const vaults = await callReadMethodSilent(contract, 'vaultsConnected');

  const nodeOperators = await Promise.all(
    vaults.map(async (vault) => {
      const vaultContract = getStakingVaultContract(vault);
      const nodeOperator = await callReadMethodSilent(
        vaultContract,
        'nodeOperator',
      );
      return { vault, nodeOperator };
    }),
  );

  const vaultsByNO = nodeOperators.filter(
    ({ nodeOperator }) => nodeOperator === account.address,
  );

  return vaultsByNO.map(({ vault }) => vault);
};

export const chooseVault = async () => {
  const [vaultsByOwner, vaultsByNO] = await Promise.all([
    getVaultsByOwner(),
    getVaultsByNO(),
  ]);

  const uniqueVaults = [...new Set([...vaultsByOwner, ...vaultsByNO])];
  const vaultsWithRole = uniqueVaults.map((vault) => {
    let title = '';

    if (vaultsByNO.includes(vault)) {
      title = `Node Operator`;
    }

    if (vaultsByOwner.includes(vault)) {
      const separator = title.length > 0 ? ', ' : '';
      title = `${title}${separator}Owner`;
    }

    return { title: `${vault} (${title})`, value: vault };
  });

  const vault = await selectPrompt('Choose a vault', 'address', vaultsWithRole);

  if (!vault.address) throw new Error('No vault selected');

  return vault.address;
};
