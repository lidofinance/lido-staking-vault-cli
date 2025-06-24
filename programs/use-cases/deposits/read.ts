import { Option } from 'commander';

import { getCommandsJson, logInfo } from 'utils';

import { deposits } from './main.js';

const depositsRead = deposits
  .command('read')
  .aliases(['r'])
  .description('vault operations read commands');

depositsRead.addOption(new Option('-cmd2json'));
depositsRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(depositsRead));
  process.exit();
});
