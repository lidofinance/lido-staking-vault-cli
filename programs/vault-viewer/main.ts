import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson, logInfo } from 'utils';

export const vaultViewer = program.command('v-v').description('vault viewer');

vaultViewer.addOption(new Option('-cmd2json'));
vaultViewer.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(vaultViewer));
  process.exit();
});
