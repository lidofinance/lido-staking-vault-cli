import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson } from 'utils';

export const vault = program.command('vault').description('vault contract');

vault.addOption(new Option('-cmd2json'));

vault.on('option:-cmd2json', function () {
  console.info(getCommandsJson(vault));
  process.exit();
});
