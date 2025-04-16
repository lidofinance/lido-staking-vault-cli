import { program } from 'command';
import { Option } from 'commander';
import { getCommandsJson, logInfo } from 'utils';

export const pdg = program
  .command('pdg')
  .description('predeposit guarantee contract');

pdg.addOption(new Option('-cmd2json'));
pdg.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(pdg));
  process.exit();
});
