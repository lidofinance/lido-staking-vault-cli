import { Option } from 'commander';

import { getLazyOracleContract } from 'contracts';
import { LazyOracleAbi } from 'abi';
import { generateReadCommands, getCommandsJson, logInfo } from 'utils';
import { getLazyOracleBaseInfo } from 'features';

import { lazyOracle } from './main.js';
import { readCommandConfig } from './config.js';

export const lazyOracleRead = lazyOracle
  .command('read')
  .alias('r')
  .description('read commands');

lazyOracleRead.addOption(new Option('-cmd2json'));
lazyOracleRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(lazyOracleRead));
  process.exit();
});

lazyOracleRead
  .command('info')
  .description('get lazy oracle base info')
  .action(async () => {
    await getLazyOracleBaseInfo();
  });

generateReadCommands(
  LazyOracleAbi,
  getLazyOracleContract,
  lazyOracleRead,
  readCommandConfig,
);
