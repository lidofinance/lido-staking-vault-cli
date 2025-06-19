import { program } from 'command';

import { createVault, prepareCreateVaultPayload } from 'features';
import { RoleAssignment } from 'types';
import {
  confirmCreateVaultParams,
  logResult,
  logInfo,
  stringToBigInt,
  jsonToRoleAssignment,
  logCancel,
  logTable,
} from 'utils';

import { vaultOperationsWrite } from './write.js';

const vaultOperationsCreateVault = vaultOperationsWrite
  .command('create-vault')
  .description('creates a new StakingVault and Dashboard contracts');

vaultOperationsCreateVault
  .command('create-vault')
  .description('creates a new StakingVault and Dashboard contracts')
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
      const createVaultData = prepareCreateVaultPayload({
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        confirmExpiry,
        nodeOperatorFeeBP,
        quantity,
        options,
      });
      if (!createVaultData) return;

      const { payload, list, otherRoles } = createVaultData;
      const transactions = [];

      const confirm = await confirmCreateVaultParams(payload, otherRoles);
      if (!confirm) return logCancel('Vault creation cancelled');

      try {
        for (const _ of list) {
          const tx = await createVault(payload, otherRoles);
          transactions.push(tx);
        }

        logResult({});
        transactions.forEach((tx) => {
          if (program.opts().populateTx) {
            logInfo('Populated transaction data:', tx);
            return;
          }
          logTable({
            data: [
              ['Vault Address', tx?.vault],
              ['Dashboard Address', tx?.dashboard],
              ['Owner Address', tx?.owner],
              ['Transaction Hash', tx?.tx],
              ['Block Number', tx?.blockNumber],
            ],
          });
        });
      } catch (err) {
        if (err instanceof Error) {
          logInfo('Error occurred while creating vaults', err.message);
        }
      }
    },
  );

vaultOperationsCreateVault
  .command('create-vault-without-connecting')
  .description(
    'creates a new StakingVault and Dashboard contracts without connecting to VaultHub',
  )
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
      const createVaultData = prepareCreateVaultPayload({
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        confirmExpiry,
        nodeOperatorFeeBP,
        quantity,
        options,
      });
      if (!createVaultData) return;

      const { payload, list, otherRoles } = createVaultData;
      const transactions = [];

      const confirm = await confirmCreateVaultParams(payload, otherRoles);
      if (!confirm) return logCancel('Vault creation cancelled');

      try {
        for (const _ of list) {
          const tx = await createVault(
            payload,
            otherRoles,
            'createVaultWithDashboardWithoutConnectingToVaultHub',
          );
          transactions.push(tx);
        }

        logResult({});
        // eslint-disable-next-line sonarjs/no-identical-functions
        transactions.forEach((tx) => {
          if (program.opts().populateTx) {
            logInfo('Populated transaction data:', tx);
            return;
          }
          logTable({
            data: [
              ['Vault Address', tx?.vault],
              ['Dashboard Address', tx?.dashboard],
              ['Owner Address', tx?.owner],
              ['Transaction Hash', tx?.tx],
              ['Block Number', tx?.blockNumber],
            ],
          });
        });
      } catch (err) {
        if (err instanceof Error) {
          logInfo('Error occurred while creating vaults', err.message);
        }
      }
    },
  );
