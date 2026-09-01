import { Address, parseEventLogs } from 'viem';
import { DashboardFactoryAbi } from 'abi';
import { Option } from 'commander';
import { getDashboardFactoryContract } from 'contracts';
import {
  getConfirmExpiry,
  getNodeOperatorFeeRate,
  prepareCreateVaultPayload,
} from 'features';
import { RoleAssignment } from 'types';
import {
  callWriteMethodWithReceipt,
  confirmOperation,
  logInfo,
  getCommandsJson,
  stringToAddress,
  stringToNumber,
  jsonToRoleAssignment,
  logTable,
} from 'utils';

import { dashboardFactory } from './main.js';

const dashboardFactoryWrite = dashboardFactory
  .command('write')
  .alias('w')
  .description('dashboard factory write commands');

dashboardFactoryWrite.addOption(new Option('-cmd2json'));
dashboardFactoryWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboardFactoryWrite));
  process.exit();
});

dashboardFactoryWrite
  .command('create-dashboard')
  .alias('c-d')
  .description('create Dashboard contract by StakingVault')
  .argument('<stakingVault>', 'staking vault address', stringToAddress)
  .argument('<defaultAdmin>', 'default admin address', stringToAddress)
  .argument('<nodeOperator>', 'node operator address')
  .argument('<nodeOperatorManager>', 'node operator manager address')
  .argument('<confirmExpiry>', 'confirm expiry', stringToNumber)
  .argument(
    '<nodeOperatorFeeRate>',
    'Node operator fee rate, for e.g. 100 == 1%',
    stringToNumber,
  )
  .option(
    '-r, --roles <roles>',
    'other roles to assign to the vault',
    jsonToRoleAssignment,
  )
  .action(
    async (
      stakingVault: Address,
      defaultAdmin: Address,
      nodeOperator: Address,
      nodeOperatorManager: Address,
      confirmExpiry: number,
      nodeOperatorFeeRate: number,
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
        quantity: '1', // prepareCreateVaultPayload wait the quantity as string
        roles: options.roles,
      });
      if (!createVaultData) return;

      const { payload, otherRoles } = createVaultData;

      const confirm = await confirmOperation(
        `Are you sure you want to create dashboard for the staking vault ${stakingVault} with default admin is ${defaultAdmin}?`,
      );
      if (!confirm) return;

      const contract = await getDashboardFactoryContract();

      try {
        const result = await callWriteMethodWithReceipt({
          contract,
          methodName: 'createDashboard',
          payload: [
            stakingVault,
            payload.defaultAdmin,
            payload.nodeOperator,
            payload.nodeOperatorManager,
            payload.nodeOperatorFeeRate,
            payload.confirmExpiry,
            otherRoles,
          ],
        });

        if (!result) return;

        const { receipt, tx } = result;

        // Gnosis safe case
        if (!receipt) {
          logInfo('Transaction has been sent');
          return;
        }

        const events = parseEventLogs({
          abi: DashboardFactoryAbi,
          logs: receipt.logs,
        });

        const dashboardEvent = events.find(
          (event) => event.eventName === 'DashboardCreated',
        );
        const dashboard = dashboardEvent?.args.dashboard;
        const owner = dashboardEvent?.args.admin;

        logTable({
          data: [
            ['Dashboard Address', dashboard],
            ['Owner Address', owner],
            ['Transaction Hash', tx],
            ['Block Number', receipt.blockNumber],
          ],
        });
      } catch (err) {
        if (err instanceof Error) {
          logInfo('Error occurred while creating dashboard', err.message);
        }
      }
    },
  );
