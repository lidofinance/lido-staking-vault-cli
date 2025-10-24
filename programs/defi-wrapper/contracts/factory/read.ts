import { type Address } from 'viem';
import { Option } from 'commander';

import { FactoryAbi } from 'abi/defi-wrapper/index.js';
import { getFactoryContract } from 'contracts/defi-wrapper/index.js';
import {
  generateReadCommands,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
} from 'utils';

import { factory } from './main.js';
import { readCommandConfig } from './config.js';

const factoryRead = factory
  .command('read')
  .alias('r')
  .description('read commands');

factoryRead.addOption(new Option('-cmd2json'));
factoryRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(factoryRead));
  process.exit();
});

factoryRead
  .command('info')
  .description('get factory base info')
  .argument('<address>', 'factory address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getFactoryContract(address);

    const [
      dummyImplementation,
      ggvStrategyFactory,
      loopStrategyFactory,
      stvPoolFactory,
      stvStethPoolFactory,
      stvStrategyPoolFactory,
      timelockFactory,
      vaultFactory,
      withdrawalQueueFactory,
      lazyOracle,
      steth,
      wsteth,
      timelockMinDelay,
    ] = await Promise.all([
      callReadMethodSilent(contract, 'DUMMY_IMPLEMENTATION'),
      callReadMethodSilent(contract, 'GGV_STRATEGY_FACTORY'),
      callReadMethodSilent(contract, 'LOOP_STRATEGY_FACTORY'),
      callReadMethodSilent(contract, 'STV_POOL_FACTORY'),
      callReadMethodSilent(contract, 'STV_STETH_POOL_FACTORY'),
      callReadMethodSilent(contract, 'STV_STRATEGY_POOL_FACTORY'),
      callReadMethodSilent(contract, 'TIMELOCK_FACTORY'),
      callReadMethodSilent(contract, 'VAULT_FACTORY'),
      callReadMethodSilent(contract, 'WITHDRAWAL_QUEUE_FACTORY'),

      callReadMethodSilent(contract, 'LAZY_ORACLE'),
      callReadMethodSilent(contract, 'STETH'),
      callReadMethodSilent(contract, 'WSTETH'),

      callReadMethodSilent(contract, 'TIMELOCK_MIN_DELAY'),
    ]);

    logResult({
      data: [
        ['dummyImplementation', dummyImplementation],
        ['ggvStrategyFactory', ggvStrategyFactory],
        ['loopStrategyFactory', loopStrategyFactory],
        ['stvPoolFactory', stvPoolFactory],
        ['stvStethPoolFactory', stvStethPoolFactory],
        ['stvStrategyPoolFactory', stvStrategyPoolFactory],
        ['timelockFactory', timelockFactory],
        ['vaultFactory', vaultFactory],
        ['withdrawalQueueFactory', withdrawalQueueFactory],
        ['lazyOracle', lazyOracle],
        ['steth', steth],
        ['wsteth', wsteth],
        ['timelockMinDelay', timelockMinDelay],
      ],
    });
  });

generateReadCommands(
  FactoryAbi,
  getFactoryContract,
  factoryRead,
  readCommandConfig,
);
