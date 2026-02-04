import { Hex, type Address } from 'viem';
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
  stringToHash,
} from 'utils';

import { factory } from './main.js';
import { readCommandConfig } from './config.js';
import { getPublicClient } from 'providers';
import { getTransactionReceipt } from 'viem/actions';
import {
  getCreatePoolEventData,
  getFinalizePoolEventData,
  logCreatePoolEventData,
  logFinalizePoolEventData,
} from 'features';

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

factoryRead
  .command('log-creating-pool-data')
  .aliases(['log-data'])
  .description(
    'logs the data of the created pool. Will be necessary for use in the UI configuration',
  )
  .argument(
    '<txHash>',
    'transaction hash of the first step of the pool creation',
    stringToHash,
  )
  .argument(
    '[finalizeTxHash]',
    'transaction hash of the final step of the pool creation',
    stringToHash,
  )
  .action(async (txHash: Hex, finalizeTxHash?: Hex) => {
    const publicClient = await getPublicClient();

    const [firstStepReceipt, finalizeReceipt] = await Promise.all([
      getTransactionReceipt(publicClient, {
        hash: txHash,
      }),
      finalizeTxHash
        ? getTransactionReceipt(publicClient, {
            hash: finalizeTxHash,
          })
        : undefined,
    ]);

    const [firstStepEventData, finalizeEventData] = await Promise.all([
      getCreatePoolEventData(firstStepReceipt, txHash),
      finalizeReceipt && finalizeTxHash
        ? getFinalizePoolEventData(finalizeReceipt, finalizeTxHash)
        : undefined,
    ]);

    if (finalizeEventData && finalizeTxHash) {
      logFinalizePoolEventData(firstStepEventData, finalizeEventData);
    } else {
      logCreatePoolEventData(firstStepEventData);
    }
  });

generateReadCommands(
  FactoryAbi,
  getFactoryContract,
  factoryRead,
  readCommandConfig,
);
