import { Address, Hex } from 'viem';
import { Option } from 'commander';

import { DashboardAbi } from 'abi';
import {
  getDashboardBaseInfo,
  getDashboardRoles,
  getDashboardHealth,
  getDashboardOverview,
  type RoleName,
} from 'features';
import { getDashboardContract, getVaultHubContract } from 'contracts';
import {
  generateReadCommands,
  logResult,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  getConfirmationsInfo,
  logTable,
} from 'utils';

import { dashboard } from './main.js';
import { readCommandConfig } from './config.js';

const dashboardRead = dashboard
  .command('read')
  .alias('r')
  .description('read commands');

dashboardRead.addOption(new Option('-cmd2json'));
dashboardRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboardRead));
  process.exit();
});

dashboardRead
  .command('info')
  .description('get dashboard base info')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await getDashboardBaseInfo(contract);
  });

dashboardRead
  .command('overview')
  .description('get dashboard overview')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getDashboardOverview(contract);
  });

dashboardRead
  .command('roles')
  .description('get dashboard roles')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getDashboardRoles(contract);
  });

dashboardRead
  .command('health')
  .description('get vault health info')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    await getDashboardHealth(contract);
  });

dashboardRead
  .command('dashboard-address-by-vault')
  .alias('dashboard-by-vault')
  .description('get dashboard address by vault')
  .argument('<vault>', 'vault address', stringToAddress)
  .action(async (vault: Address) => {
    const vaultHub = await getVaultHubContract();
    const vaultConnection = await callReadMethodSilent(
      vaultHub,
      'vaultConnection',
      [vault],
    );
    logResult({
      data: [['Dashboard Address', vaultConnection.owner]],
    });
  });

dashboardRead
  .command('vault-by-dashboard')
  .description('get vault address by dashboard')
  .argument('<dashboard>', 'dashboard address', stringToAddress)
  .action(async (dashboard: Address) => {
    const dashboardContract = getDashboardContract(dashboard);
    const vault = await callReadMethodSilent(dashboardContract, 'stakingVault');

    logResult({
      data: [['Vault Address', vault]],
    });
  });

dashboardRead
  .command('confirmations-log')
  .description('get pending confirmations')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const confirmations = await getConfirmationsInfo(
      contract as any,
      contract.abi,
    );

    if (!confirmations) return console.error('No confirmations found');

    logResult({});
    Object.entries(confirmations).forEach(
      (
        [data, { member, role, expiryTimestamp, expiryDate, decodedData }],
        idx,
      ) => {
        console.info(`\nEvent ${idx + 1}`);
        logTable({
          data: [
            ['Member', member],
            ['Role', role],
            [
              'Expiry Timestamp',
              `${expiryTimestamp.toString()} (${expiryDate})`,
            ],
            ['Data', data],
          ],
        });

        console.info('Decoded data:');
        logTable({
          data: [
            ['Function', decodedData.functionName],
            ['Argument', decodedData.args[0]],
          ],
        });
      },
    );
  });

dashboardRead
  .command('confirming-roles')
  .description('get confirming roles')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const confirmingRoles = await callReadMethodSilent(
      contract,
      'confirmingRoles',
    );
    const confirmingRolesNames: RoleName[] = [
      'DEFAULT_ADMIN_ROLE',
      'NODE_OPERATOR_MANAGER_ROLE',
    ];
    const roleValues: Hex[] = await Promise.all(
      confirmingRolesNames.map((key) => (contract.read as any)[key]()),
    );

    const result = await Promise.all(
      confirmingRoles.map(async (key) => {
        const roleName = confirmingRolesNames.find(
          (role) => roleValues[confirmingRolesNames.indexOf(role)] === key,
        );
        const accounts = await contract.read.getRoleMembers([key]);
        return {
          Role: roleName ?? 'Unknown',
          Keccak: key,
          Members: accounts.length > 0 ? accounts.join(', ') : 'None',
        };
      }),
    );

    logResult({
      data: result.map(({ Role, Keccak, Members }) => [Role, Keccak, Members]),
      params: {
        head: ['Role', 'Keccak', 'Members'],
      },
    });
  });

generateReadCommands(
  DashboardAbi,
  getDashboardContract,
  dashboardRead,
  readCommandConfig,
);
