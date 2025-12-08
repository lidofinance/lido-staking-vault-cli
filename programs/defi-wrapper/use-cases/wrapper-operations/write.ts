import { Option } from 'commander';
import { logInfo, getCommandsJson } from 'utils';
import { wrapperOperations } from './main.js';

export const wrapperOperationsWrite = wrapperOperations
  .command('write')
  .aliases(['w'])
  .description('wrapper operations write commands');

wrapperOperationsWrite.addOption(new Option('-cmd2json'));
wrapperOperationsWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(wrapperOperationsWrite));
  process.exit();
});
