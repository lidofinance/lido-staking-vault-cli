import { Option } from 'commander';

import { generateReadCommands, getCommandsJson, logInfo } from 'utils';
import { OperatorGridAbi } from 'abi';
import { getOperatorGridContract } from 'contracts';
import { getOperatorGridBaseInfo, getOperatorGridRoles } from 'features';

import { operatorGrid } from './main.js';
import { readCommandConfig } from './config.js';

const operatorGridRead = operatorGrid
  .command('read')
  .aliases(['r'])
  .description('operator grid read commands');

operatorGridRead.addOption(new Option('-cmd2json'));
operatorGridRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(operatorGridRead));
  process.exit();
});

operatorGridRead.command('info').action(async () => {
  await getOperatorGridBaseInfo();
});

operatorGridRead.command('roles').action(async () => {
  await getOperatorGridRoles();
});

generateReadCommands(
  OperatorGridAbi,
  getOperatorGridContract,
  operatorGridRead,
  readCommandConfig,
);
