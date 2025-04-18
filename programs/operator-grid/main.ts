import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson, logInfo } from 'utils';

export const operatorGrid = program
  .command('operator-grid')
  .description('operator grid contract');

operatorGrid.addOption(new Option('-cmd2json'));
operatorGrid.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(operatorGrid));
  process.exit();
});
