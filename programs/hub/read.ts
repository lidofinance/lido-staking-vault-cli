import { getVaultHubContract } from 'contracts';
import { callReadMethod, generateReadCommands, printError } from 'utils';
import { VaultHubAbi } from 'abi';

import { vaultHub } from './main.js';
import { readCommandConfig } from './config.js';

// Works fine
vaultHub
  .command('constants')
  .description('get vault hub constants')
  .action(async () => {
    const contract = await getVaultHubContract();

    try {
      const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
      const VAULT_REGISTRY_ROLE = await contract.read.VAULT_REGISTRY_ROLE();
      const LIDO = await contract.read.LIDO();
      const LIDO_LOCATOR = await contract.read.LIDO_LOCATOR();
      const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
      const PAUSE_INFINITELY = await contract.read.PAUSE_INFINITELY();
      const PAUSE_ROLE = await contract.read.PAUSE_ROLE();
      const RESUME_ROLE = await contract.read.RESUME_ROLE();
      const CONTRACT_ADDRESS = contract.address;

      const payload = {
        VAULT_MASTER_ROLE,
        DEFAULT_ADMIN_ROLE,
        VAULT_REGISTRY_ROLE,
        LIDO,
        LIDO_LOCATOR,
        PAUSE_INFINITELY,
        PAUSE_ROLE,
        RESUME_ROLE,
        CONTRACT_ADDRESS,
      };

      console.table(Object.entries(payload));
    } catch (err) {
      printError(err, 'Error when calling read method "constants"');
    }
  });

generateReadCommands(
  VaultHubAbi,
  getVaultHubContract,
  vaultHub,
  readCommandConfig,
);

// // Works fine

vaultHub
  .command('vi')
  .description('get vault and vault socket by index')
  .argument('<index>', 'index')
  .action(async (index: string) => {
    const biIndex = BigInt(index);
    const contract = await getVaultHubContract();

    try {
      const vault = await callReadMethod(contract, 'vault', [biIndex]);
      const vaultSocket = await callReadMethod(contract, 'vaultSocket', [
        biIndex,
      ]);

      console.table({
        Vault: vault,
        'Vault Socket': vaultSocket,
      });
    } catch (err) {
      printError(err, 'Error when getting vault and vault socket');
    }
  });
