import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson, logInfo } from 'utils';

export const delegation = program
  .command('delegation')
  .description('delegation contract');

delegation.addOption(new Option('-cmd2json'));
delegation.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(delegation));
  process.exit();
});
