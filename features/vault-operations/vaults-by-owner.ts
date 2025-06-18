import { getVaultViewerContract } from 'contracts';
import { callReadMethodSilent, selectPrompt } from 'utils';
import { getAccount } from 'providers';

export const getVaultsByOwner = async () => {
  const contract = getVaultViewerContract();
  const account = getAccount();

  const vaults = await callReadMethodSilent(contract, 'vaultsByOwner', [
    account.address,
  ]);

  return vaults;
};

export const chooseVault = async () => {
  const vaults = await getVaultsByOwner();

  const vault = await selectPrompt(
    'Choose a vault',
    'address',
    vaults.map((vault) => ({
      title: vault,
      value: vault,
    })),
  );

  return vault.address;
};
