import { Address, Hex } from 'viem';
import { getTransactionReceipt } from 'viem/actions';
import { program } from 'command';

import {
  createVault,
  prepareCreateVaultPayload,
  getAddress,
  getConfirmExpiry,
  getNodeOperatorFeeRate,
  getCreateVaultEventData,
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
  logTable,
  stringToNumber,
} from 'utils';

import { vaultOperationsWrite } from './write.js';
import { getPublicClient } from 'providers';

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

      const confirmExpiryValue = await getConfirmExpiry({ confirmExpiry });
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
              ['Default Admin Address', item.owner],
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

      const confirmExpiryValue = await getConfirmExpiry({ confirmExpiry });
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
              ['Default Admin Address', item.owner],
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

vaultOperationsCreateVault
  .command('log-creating-vault-data')
  .aliases(['log-data'])
  .description('logs the data of the created vault')
  .argument('<txHash>', 'transaction hash of the vault creation')
  .action(async (txHash: Hex) => {
    const publicClient = await getPublicClient();
    const receipt = await getTransactionReceipt(publicClient, { hash: txHash });
    const eventData = await getCreateVaultEventData(receipt, txHash);

    logTable({
      data: [
        ['Vault Address', eventData.vault],
        ['Dashboard Address', eventData.dashboard],
        ['Default Admin Address', eventData.owner],
        ['Node Operator Address', eventData.nodeOperator],
        [
          'Node Operator Manager Address',
          eventData.nodeOperatorManager.join(', '),
        ],
        ['Transaction Hash', eventData.tx],
        ['Block Number', eventData.blockNumber],
      ],
    });
  });
