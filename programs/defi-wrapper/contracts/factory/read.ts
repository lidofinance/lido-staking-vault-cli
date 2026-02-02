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
    const contract = await getFactoryContract(address);

    const [
      dummyImplementation,
      stvPoolFactory,
      stvStethPoolFactory,
      timelockFactory,
      vaultFactory,
      withdrawalQueueFactory,
      lazyOracle,
      steth,
      wsteth,
    ] = await Promise.all([
      callReadMethodSilent({
        contract,
        methodName: 'DUMMY_IMPLEMENTATION',
        payload: [],
      }),

      callReadMethodSilent({
        contract,
        methodName: 'STV_POOL_FACTORY',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'STV_STETH_POOL_FACTORY',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'TIMELOCK_FACTORY',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'VAULT_FACTORY',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'WITHDRAWAL_QUEUE_FACTORY',
        payload: [],
      }),

      callReadMethodSilent({
        contract,
        methodName: 'LAZY_ORACLE',
        payload: [],
      }),
      callReadMethodSilent({ contract, methodName: 'STETH', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'WSTETH', payload: [] }),
    ]);

    logResult({
      data: [
        ['dummyImplementation', dummyImplementation],
        ['stvPoolFactory', stvPoolFactory],
        ['stvStethPoolFactory', stvStethPoolFactory],
        ['timelockFactory', timelockFactory],
        ['vaultFactory', vaultFactory],
        ['withdrawalQueueFactory', withdrawalQueueFactory],
        ['lazyOracle', lazyOracle],
        ['steth', steth],
        ['wsteth', wsteth],
      ],
    });
  });

generateReadCommands(
  FactoryAbi,
  getFactoryContract,
  factoryRead,
  readCommandConfig,
);
