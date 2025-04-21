import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson, logInfo } from 'utils';

export const vaultHub = program
  .command('hub')
  .description('vault hub contract');

vaultHub.addOption(new Option('-cmd2json'));
vaultHub.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultHub));
  process.exit();
});
