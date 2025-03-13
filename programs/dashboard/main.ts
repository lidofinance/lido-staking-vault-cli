import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson } from 'utils';

export const dashboard = program
  .command('dashboard')
  .description('dashboard contract');

dashboard.addOption(new Option('-cmd2json'));
dashboard.on('option:-cmd2json', function () {
  console.info(getCommandsJson(dashboard));
  process.exit();
});
