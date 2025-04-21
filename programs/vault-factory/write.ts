import { program } from 'command';
import { Option } from 'commander';

import { createVault } from 'features';
import { RoleAssignment, VaultWithDashboard } from 'types';
import {
  validateAddressesMap,
  validateAddressMap,
  transformAddressesToArray,
  confirmCreateVaultParams,
  logResult,
  logInfo,
  logError,
  stringToBigInt,
  jsonToRoleAssignment,
  logCancel,
  getCommandsJson,
} from 'utils';

import { vaultFactory } from './main.js';

const vaultFactoryWrite = vaultFactory
  .command('write')
  .aliases(['w'])
  .description('vault factory write commands');

vaultFactoryWrite.addOption(new Option('-cmd2json'));
vaultFactoryWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultFactoryWrite));
  process.exit();
});

vaultFactoryWrite
  .command('create-vault')
  .description('create vault contract')
  .argument('<defaultAdmin>', 'default admin address')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<nodeOperatorManager>', 'node operator manager address')
  .argument('<confirmExpiry>', 'confirm expiry', stringToBigInt)
  .argument(
    '<nodeOperatorFeeBP>',
    'Node operator fee, for e.g. 100 == 1%',
    stringToBigInt,
  )
  .argument('[quantity]', 'quantity of vaults to create, default 1', '1')
  .option(
    '-r, --roles <roles>',
    'other roles to assign to the vault',
    jsonToRoleAssignment,
  )
  .action(
    async (
      defaultAdmin: string,
      nodeOperator: string,
      nodeOperatorManager: string,
      confirmExpiry: bigint,
      nodeOperatorFeeBP: bigint,
      quantity: string,
      options: { roles: RoleAssignment[] },
    ) => {
      const qnt = parseInt(quantity);
      const otherRoles = options.roles;

      if (isNaN(qnt)) {
        logError('quantity must be a number');
        return;
      }

      const addresses = transformAddressesToArray(otherRoles);

      const errorsAddressesList = validateAddressesMap(addresses);
      const errorsList = [
        ...errorsAddressesList,
        ...validateAddressMap([
          nodeOperator,
          defaultAdmin,
          nodeOperatorManager,
        ]),
      ];
      if (errorsList.length > 0) {
        errorsList.forEach((error) => program.error(error));
        return;
      }

      // eslint-disable-next-line unicorn/new-for-builtins
      const list: number[] = Array.from(Array(qnt));
      const payload = {
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        confirmExpiry,
        nodeOperatorFeeBP,
      } as VaultWithDashboard;

      const transactions = [];

      const { confirm } = await confirmCreateVaultParams(payload, otherRoles);
      if (!confirm) return logCancel('Vault creation cancelled');

      try {
        for (const _ of list) {
          const tx = await createVault(payload, otherRoles);
          transactions.push(tx);
        }

        logResult(transactions);
      } catch (err) {
        if (err instanceof Error) {
          logInfo('Error occurred while creating vaults', err.message);
        }
      }
    },
  );
