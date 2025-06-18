import { Option } from 'commander';

import { logInfo, getCommandsJson } from 'utils';

import { vaultOperations } from './main.js';

const vaultOperationsWrite = vaultOperations
  .command('write')
  .aliases(['w'])
  .description('vault operations write commands');

vaultOperationsWrite.addOption(new Option('-cmd2json'));
vaultOperationsWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultOperationsWrite));
  process.exit();
});
