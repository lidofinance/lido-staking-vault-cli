import { Address } from 'viem';
import { program } from 'command';

import {
  createVault,
  prepareCreateVaultPayload,
  getAddress,
  getConfirmExpiry,
  getNodeOperatorFeeRate,
} from 'features';
import { RoleAssignment } from 'types';
import {
  confirmCreateVaultParams,
  logResult,
  logInfo,
  jsonToRoleAssignment,
  logCancel,
  logTable,
  stringToNumber,
} from 'utils';

import { vaultOperationsWrite } from './write.js';

const vaultOperationsCreateVault = vaultOperationsWrite
  .command('create-vault')
  .description('creates a new StakingVault and Dashboard contracts');

vaultOperationsCreateVault
  .command('create')
  .description('creates a new StakingVault and Dashboard contracts')
  .option('-da, --defaultAdmin <defaultAdmin>', 'default admin address')
  .option('-no, --nodeOperator <nodeOperator>', 'node operator address')
  .option(
    '-nom, --nodeOperatorManager <nodeOperatorManager>',
    'node operator manager address',
  )
  .option(
    '-ce, --confirmExpiry <confirmExpiry>',
    'confirm expiry in seconds',
    stringToNumber,
  )
  .option(
    '-nof , --nodeOperatorFeeRate <nodeOperatorFeeRate>',
    'Node operator fee rate in basis points, for e.g. 100 == 1%',
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
      quantity: string,
      {
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        confirmExpiry,
        nodeOperatorFeeRate,
        roles,
      }: {
        defaultAdmin: Address;
        nodeOperator: Address;
        nodeOperatorManager: Address;
        confirmExpiry: number;
        nodeOperatorFeeRate: number;
        roles: RoleAssignment[];
      },
    ) => {
      const defaultAdminAddress = await getAddress(
        defaultAdmin,
        'Default Admin',
      );
      const nodeOperatorAddress = await getAddress(
        nodeOperator,
        'Node Operator',
      );
      const nodeOperatorManagerAddress = await getAddress(
        nodeOperatorManager,
        'Node Operator Manager',
      );

      const confirmExpiryValue = await getConfirmExpiry(confirmExpiry);
      const nodeOperatorFeeRateValue =
        await getNodeOperatorFeeRate(nodeOperatorFeeRate);

      const createVaultData = prepareCreateVaultPayload({
        defaultAdmin: defaultAdminAddress,
        nodeOperator: nodeOperatorAddress,
        nodeOperatorManager: nodeOperatorManagerAddress,
        confirmExpiry: confirmExpiryValue,
        nodeOperatorFeeRate: nodeOperatorFeeRateValue,
        quantity,
        roles,
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
              ['Default Admin Address', tx?.owner],
              ['Node Operator Address', nodeOperatorAddress],
              ['Node Operator Manager Address', nodeOperatorManagerAddress],
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
  .command('create-without-connecting')
  .description(
    'creates a new StakingVault and Dashboard contracts without connecting to VaultHub',
  )
  .option('-da, --defaultAdmin <defaultAdmin>', 'default admin address')
  .option('-no, --nodeOperator <nodeOperator>', 'node operator address')
  .option(
    '-nom, --nodeOperatorManager <nodeOperatorManager>',
    'node operator manager address',
  )
  .option(
    '-ce, --confirmExpiry <confirmExpiry>',
    'confirm expiry in seconds',
    stringToNumber,
  )
  .option(
    '-nof , --nodeOperatorFeeRate <nodeOperatorFeeRate>',
    'Node operator fee rate in basis points, for e.g. 100 == 1%',
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
      quantity: string,
      {
        defaultAdmin,
        nodeOperator,
        nodeOperatorManager,
        confirmExpiry,
        nodeOperatorFeeRate,
        roles,
      }: {
        defaultAdmin: Address;
        nodeOperator: Address;
        nodeOperatorManager: Address;
        confirmExpiry: number;
        nodeOperatorFeeRate: number;
        roles: RoleAssignment[];
      },
    ) => {
      const defaultAdminAddress = await getAddress(
        defaultAdmin,
        'Default Admin',
      );
      const nodeOperatorAddress = await getAddress(
        nodeOperator,
        'Node Operator',
      );
      const nodeOperatorManagerAddress = await getAddress(
        nodeOperatorManager,
        'Node Operator Manager',
      );

      const confirmExpiryValue = await getConfirmExpiry(confirmExpiry);
      const nodeOperatorFeeRateValue =
        await getNodeOperatorFeeRate(nodeOperatorFeeRate);

      const createVaultData = prepareCreateVaultPayload({
        defaultAdmin: defaultAdminAddress,
        nodeOperator: nodeOperatorAddress,
        nodeOperatorManager: nodeOperatorManagerAddress,
        confirmExpiry: confirmExpiryValue,
        nodeOperatorFeeRate: nodeOperatorFeeRateValue,
        quantity,
        roles,
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
              ['Default Admin Address', tx?.owner],
              ['Node Operator Address', nodeOperatorAddress],
              ['Node Operator Manager Address', nodeOperatorManagerAddress],
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
