import { type Address, formatEther, formatUnits } from 'viem';
import { Option } from 'commander';

import { StvStETHPoolAbi } from 'abi/defi-wrapper/index.js';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/index.js';
import {
  generateReadCommands,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
} from 'utils';

import { stvStethPool } from './main.js';
import { readCommandConfig } from './config.js';

const stvStethPoolRead = stvStethPool
  .command('read')
  .alias('r')
  .description('read commands');

stvStethPoolRead.addOption(new Option('-cmd2json'));
stvStethPoolRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(stvStethPoolRead));
  process.exit();
});

stvStethPoolRead
  .command('info')
  .description('get stv pool base info')
  .argument('<address>', 'stv pool address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getStvStethPoolContract(address);

    const [
      poolType,
      DEFAULT_ADMIN_ROLE,
      DEPOSIT_ROLE,
      ALLOW_LIST_MANAGER_ROLE,
      DASHBOARD,
      VAULT,
      STETH,
      VAULT_HUB,
      WITHDRAWAL_QUEUE,
      ALLOW_LIST_ENABLED,
      name,
      symbol,
      totalAssets,
      totalExceedingMintedSteth,
      totalLiabilityShares,
      totalNominalAssets,
      totalSupply,
      totalUnassignedLiabilityShares,
    ] = await Promise.all([
      callReadMethodSilent({ contract, methodName: 'poolType', payload: [] }),

      callReadMethodSilent({
        contract,
        methodName: 'DEFAULT_ADMIN_ROLE',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'DEPOSIT_ROLE',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'ALLOW_LIST_MANAGER_ROLE',
        payload: [],
      }),

      callReadMethodSilent({ contract, methodName: 'DASHBOARD', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'VAULT', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'STETH', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'VAULT_HUB', payload: [] }),
      callReadMethodSilent({
        contract,
        methodName: 'WITHDRAWAL_QUEUE',
        payload: [],
      }),

      callReadMethodSilent({
        contract,
        methodName: 'ALLOW_LIST_ENABLED',
        payload: [],
      }),

      callReadMethodSilent({ contract, methodName: 'name', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'symbol', payload: [] }),
      callReadMethodSilent({
        contract,
        methodName: 'totalAssets',
        payload: [],
      }),

      callReadMethodSilent({
        contract,
        methodName: 'totalExceedingMintedSteth',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'totalLiabilityShares',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'totalNominalAssets',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'totalSupply',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'totalUnassignedLiabilityShares',
        payload: [],
      }),
    ]);

    logResult({
      data: [
        ['poolType', poolType],
        ['DEFAULT_ADMIN_ROLE', DEFAULT_ADMIN_ROLE],
        ['DEPOSIT_ROLE', DEPOSIT_ROLE],
        ['ALLOW_LIST_MANAGER_ROLE', ALLOW_LIST_MANAGER_ROLE],
        ['DASHBOARD', DASHBOARD],
        ['VAULT', VAULT],
        ['STETH', STETH],
        ['VAULT_HUB', VAULT_HUB],
        ['WITHDRAWAL_QUEUE', WITHDRAWAL_QUEUE],
        ['ALLOW_LIST_ENABLED', ALLOW_LIST_ENABLED],
        ['name', name],
        ['symbol', symbol],
        ['totalAssets', formatEther(totalAssets)],
        ['totalExceedingMintedSteth', formatEther(totalExceedingMintedSteth)],
        ['totalLiabilityShares', formatEther(totalLiabilityShares)],
        ['totalNominalAssets', formatEther(totalNominalAssets)],
        ['totalSupply', formatUnits(totalSupply, 27)],
        [
          'totalUnassignedLiabilityShares',
          formatEther(totalUnassignedLiabilityShares),
        ],
      ],
    });
  });

generateReadCommands(
  StvStETHPoolAbi,
  getStvStethPoolContract,
  stvStethPoolRead,
  readCommandConfig,
);
