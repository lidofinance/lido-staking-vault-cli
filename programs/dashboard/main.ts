import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson, logInfo } from 'utils';

export const dashboard = program
  .command('dashboard')
  .description('dashboard contract');

dashboard.addOption(new Option('-cmd2json'));
dashboard.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboard));
  process.exit();
});
