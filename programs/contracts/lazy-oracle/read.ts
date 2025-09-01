import { Option } from 'commander';

import { getLazyOracleContract } from 'contracts';
import { LazyOracleAbi } from 'abi';
import { generateReadCommands, getCommandsJson, logInfo } from 'utils';

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

generateReadCommands(
  LazyOracleAbi,
  getLazyOracleContract,
  lazyOracleRead,
  readCommandConfig,
);
