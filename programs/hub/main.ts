import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson } from 'utils';

export const vaultHub = program
  .command('hub')
  .description('vault hub contract');

vaultHub.addOption(new Option('-cmd2json'));
vaultHub.on('option:-cmd2json', function () {
  console.info(getCommandsJson(vaultHub));
  process.exit();
});
