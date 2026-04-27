import { Option } from 'commander';
import { Address } from 'viem';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethod,
  generateReadCommands,
} from 'utils';
import { GenericStrategyAbi } from 'abi/defi-wrapper/index.js';
import { getGenericStrategyContract } from 'contracts/defi-wrapper/generic-strategy.js';
import { strategy } from './main.js';
import { readCommandConfig } from './config.js';

const strategyRead = strategy
  .command('read')
  .alias('r')
  .description('read commands');

strategyRead.addOption(new Option('-cmd2json'));
strategyRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(strategyRead));
  process.exit();
});

strategyRead
  .command('proxy-of')
  .description('get the strategy call forwarder (proxy) address for a user')
  .argument('<address>', 'strategy contract address', stringToAddress)
  .argument('<user>', 'user address', stringToAddress)
  .action(async (address: Address, user: Address) => {
    const contract = await getGenericStrategyContract(address);

    await callReadMethod({
      contract,
      methodName: 'getStrategyCallForwarderAddress',
      payload: [[user]],
    });
  });

generateReadCommands(
  GenericStrategyAbi,
  getGenericStrategyContract,
  strategyRead,
  readCommandConfig,
);
