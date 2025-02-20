import { program } from 'command';
import { getVaultHubViewerContract } from 'contracts';
import { getAccount } from 'providers';
import { Address } from 'viem';
import { callReadMethod } from 'utils';

// TODO: move to config
const ADDRESS = '0x5D73Eec220C7428eEAa26aF0F6d65B4dD1bb95aA';

// TODO: add methods with pagination

const vaultHubViewer = program
  .command('hub-viewer')
  .description('vault hub viewer');

vaultHubViewer
  .command('vaults-c')
  .description('get vaults connected to vault hub')
  .action(async () => {
    const contract = getVaultHubViewerContract(ADDRESS);

    await callReadMethod(contract, 'vaultsConnected');
  });

vaultHubViewer
  .command('vaults-m')
  .description('get my vaults')
  .action(async () => {
    const contract = getVaultHubViewerContract(ADDRESS);
    const account = getAccount();

    await callReadMethod(contract, 'vaultsByOwner', [account.address]);
  });

vaultHubViewer
  .command('vault-by-owner')
  .description('get vaults by owner')
  .argument('<address>', 'owner address')
  .action(async (address: Address) => {
    const contract = getVaultHubViewerContract(ADDRESS);

    await callReadMethod(contract, 'vaultsByOwner', [address]);
  });

vaultHubViewer
  .command('vault-by-role')
  .description('get vaults by role')
  .argument('<role>', 'role')
  .action(async (role: Address) => {
    const contract = getVaultHubViewerContract(ADDRESS);
    const account = getAccount();

    await callReadMethod(contract, 'vaultsByRole', [role, account.address]);
  });

vaultHubViewer
  .command('vault-by-role-and-address')
  .description('get vaults by role and address')
  .argument('<role>', 'role')
  .argument('<address>', 'address')
  .action(async (role: Address, address: Address) => {
    const contract = getVaultHubViewerContract(ADDRESS);

    await callReadMethod(contract, 'vaultsByRole', [role, address]);
  });
