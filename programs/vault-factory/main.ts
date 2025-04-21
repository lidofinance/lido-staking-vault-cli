import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson, logInfo } from 'utils';

export const vaultFactory = program
  .command('factory')
  .description('vault factory contract');

vaultFactory.addOption(new Option('-cmd2json'));
vaultFactory.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultFactory));
  process.exit();
});
