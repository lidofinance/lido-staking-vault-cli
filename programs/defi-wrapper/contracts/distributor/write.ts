import { Option } from 'commander';

import { logInfo, getCommandsJson } from 'utils';

import { distributor } from './main.js';

const distributorWrite = distributor
  .command('write')
  .alias('w')
  .description('distributor write commands');

distributorWrite.addOption(new Option('-cmd2json'));
distributorWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(distributorWrite));
  process.exit();
});
