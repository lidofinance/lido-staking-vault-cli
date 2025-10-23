import { Option } from 'commander';

import { DistributorAbi } from 'abi/defi-wrapper/index.js';
import { getDistributorContract } from 'contracts/defi-wrapper/index.js';
import { generateReadCommands, logInfo, getCommandsJson } from 'utils';

import { distributor } from './main.js';
import { readCommandConfig } from './config.js';

const distributorRead = distributor
  .command('read')
  .alias('r')
  .description('read commands');

distributorRead.addOption(new Option('-cmd2json'));
distributorRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(distributorRead));
  process.exit();
});

// dashboardRead
//   .command('info')
//   .description('get dashboard base info')
//   .argument('<address>', 'dashboard address', stringToAddress)
//   .action(async (address: Address) => {
//     const contract = getDashboardContract(address);

//     await getDashboardBaseInfo(contract);
//   });

// dashboardRead
//   .command('overview')
//   .description('get dashboard overview')
//   .argument('<address>', 'dashboard address', stringToAddress)
//   .action(async (address: Address) => {
//     const contract = getDashboardContract(address);
//     await getDashboardOverview(contract);
//   });

// dashboardRead
//   .command('roles')
//   .description('get dashboard roles')
//   .argument('<address>', 'dashboard address', stringToAddress)
//   .action(async (address: Address) => {
//     const contract = getDashboardContract(address);
//     await getDashboardRoles(contract);
//   });

generateReadCommands(
  DistributorAbi,
  getDistributorContract,
  distributorRead,
  readCommandConfig,
);
