import { Address } from 'viem';
import { program } from 'command';
import { Option } from 'commander';

import {
  createVault,
  getNodeOperatorFeeRate,
  getConfirmExpiry,
  prepareCreateVaultPayload,
  type CreateVaultResult,
  isCreateVaultResult,
} from 'features';
import { RoleAssignment } from 'types';
import {
  confirmCreateVaultParams,
  logResult,
  logInfo,
  jsonToRoleAssignment,
  logCancel,
  getCommandsJson,
  logTable,
  stringToNumber,
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
  .description('creates a new StakingVault and Dashboard contracts')
  .argument('<defaultAdmin>', 'default admin address')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<nodeOperatorManager>', 'node operator manager address')
  .argument('<confirmExpiry>', 'confirm expiry', stringToNumber)
  .argument(
    '<nodeOperatorFeeRate>',
    'Node operator fee rate, for e.g. 100 == 1%',
    stringToNumber,
  )
  .argument('[quantity]', 'quantity of vaults to create, default 1', '1')
  .option(
    '-r, --roles <roles>',
    'other roles to assign to the vault',
    jsonToRoleAssignment,
  )
  .action(
    async (
      defaultAdmin: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      confirmExpiry: number,
      nodeOperatorFeeRate: number,
      quantity: string,
      options: { roles: RoleAssignment[] },
    ) => {
      const confirmExpiryValue = await getConfirmExpiry({ confirmExpiry });
      const nodeOperatorFeeRateValue =
        await getNodeOperatorFeeRate(nodeOperatorFeeRate);

      const createVaultData = prepareCreateVaultPayload({
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        confirmExpiry: confirmExpiryValue,
        nodeOperatorFeeRate: nodeOperatorFeeRateValue,
        quantity,
        roles: options.roles,
      });
      if (!createVaultData) return;

      const { payload, list, otherRoles } = createVaultData;
      const results: (Pick<CreateVaultResult, 'tx'> | CreateVaultResult)[] = [];

      const confirm = await confirmCreateVaultParams(payload, otherRoles);
      if (!confirm) return logCancel('Vault creation cancelled');

      try {
        for (const _ of list) {
          const result = await createVault(payload, otherRoles);
          if (!result) continue;
          results.push(result);
        }

        logResult({});
        for (const item of results) {
          if (program.opts().populateTx) {
            logInfo('Populated transaction data:', item);
            continue;
          }
          // Gnosis safe case
          if (!isCreateVaultResult(item)) continue;

          logTable({
            data: [
              ['Vault Address', item.vault],
              ['Dashboard Address', item.dashboard],
              ['Owner Address', item.owner],
              ['Node Operator Address', item.nodeOperator],
              [
                'Node Operator Manager Address',
                item.nodeOperatorManager.join(', '),
              ],
              ['Transaction Hash', item.tx],
              ['Block Number', item.blockNumber],
            ],
          });
        }
      } catch (err) {
        if (err instanceof Error) {
          logInfo('Error occurred while creating vaults', err.message);
        }
      }
    },
  );

vaultFactoryWrite
  .command('create-vault-without-connecting')
  .description(
    'creates a new StakingVault and Dashboard contracts without connecting to VaultHub',
  )
  .argument('<defaultAdmin>', 'default admin address')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<nodeOperatorManager>', 'node operator manager address')
  .argument('<confirmExpiry>', 'confirm expiry', stringToNumber)
  .argument(
    '<nodeOperatorFeeRate>',
    'Node operator fee rate, for e.g. 100 == 1%',
    stringToNumber,
  )
  .argument('[quantity]', 'quantity of vaults to create, default 1', '1')
  .option(
    '-r, --roles <roles>',
    'other roles to assign to the vault',
    jsonToRoleAssignment,
  )
  .action(
    async (
      defaultAdmin: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      confirmExpiry: number,
      nodeOperatorFeeRate: number,
      quantity: string,
      options: { roles: RoleAssignment[] },
    ) => {
      const confirmExpiryValue = await getConfirmExpiry({ confirmExpiry });
      const nodeOperatorFeeRateValue =
        await getNodeOperatorFeeRate(nodeOperatorFeeRate);

      const createVaultData = prepareCreateVaultPayload({
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        confirmExpiry: confirmExpiryValue,
        nodeOperatorFeeRate: nodeOperatorFeeRateValue,
        quantity,
        roles: options.roles,
      });
      if (!createVaultData) return;

      const { payload, list, otherRoles } = createVaultData;
      const results: (Pick<CreateVaultResult, 'tx'> | CreateVaultResult)[] = [];

      const confirm = await confirmCreateVaultParams(payload, otherRoles);
      if (!confirm) return logCancel('Vault creation cancelled');

      try {
        for (const _ of list) {
          const result = await createVault(
            payload,
            otherRoles,
            'createVaultWithDashboardWithoutConnectingToVaultHub',
          );
          if (!result) continue;
          results.push(result);
        }

        logResult({});

        for (const item of results) {
          if (program.opts().populateTx) {
            logInfo('Populated transaction data:', item);
            continue;
          }
          // Gnosis safe case
          if (!isCreateVaultResult(item)) continue;

          logTable({
            data: [
              ['Vault Address', item.vault],
              ['Dashboard Address', item.dashboard],
              ['Owner Address', item.owner],
              ['Node Operator Address', item.nodeOperator],
              [
                'Node Operator Manager Address',
                item.nodeOperatorManager.join(', '),
              ],
              ['Transaction Hash', item.tx],
              ['Block Number', item.blockNumber],
            ],
          });
        }
      } catch (err) {
        if (err instanceof Error) {
          logInfo('Error occurred while creating vaults', err.message);
        }
      }
    },
  );
