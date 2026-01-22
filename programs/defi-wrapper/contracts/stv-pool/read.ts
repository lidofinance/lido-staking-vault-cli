import { type Address, formatEther, formatUnits } from 'viem';
import { Option } from 'commander';

import { StvPoolAbi } from 'abi/defi-wrapper/index.js';
import { getStvPoolContract } from 'contracts/defi-wrapper/index.js';
import {
  generateReadCommands,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
} from 'utils';

import { stvPool } from './main.js';
import { readCommandConfig } from './config.js';

const stvPoolRead = stvPool
  .command('read')
  .alias('r')
  .description('read commands');

stvPoolRead.addOption(new Option('-cmd2json'));
stvPoolRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(stvPoolRead));
  process.exit();
});

stvPoolRead
  .command('info')
  .description('get stv pool base info')
  .argument('<address>', 'stv pool address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getStvPoolContract(address);

    const [
      poolType,
      DEFAULT_ADMIN_ROLE,
      DEPOSIT_ROLE,
      ALLOW_LIST_MANAGER_ROLE,
      VAULT,
      DASHBOARD,
      STETH,
      VAULT_HUB,
      WITHDRAWAL_QUEUE,
      DISTRIBUTOR,
      ALLOW_LIST_ENABLED,
      name,
      symbol,
      totalAssets,
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

      callReadMethodSilent({ contract, methodName: 'VAULT', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'DASHBOARD', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'STETH', payload: [] }),
      callReadMethodSilent({ contract, methodName: 'VAULT_HUB', payload: [] }),
      callReadMethodSilent({
        contract,
        methodName: 'WITHDRAWAL_QUEUE',
        payload: [],
      }),
      callReadMethodSilent({
        contract,
        methodName: 'DISTRIBUTOR',
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
        ['VAULT', VAULT],
        ['DASHBOARD', DASHBOARD],
        ['STETH', STETH],
        ['VAULT_HUB', VAULT_HUB],
        ['WITHDRAWAL_QUEUE', WITHDRAWAL_QUEUE],
        ['DISTRIBUTOR', DISTRIBUTOR],
        ['ALLOW_LIST_ENABLED', ALLOW_LIST_ENABLED],
        ['name', name],
        ['symbol', symbol],
        ['totalAssets', formatEther(totalAssets)],
        ['totalLiabilityShares', formatEther(totalLiabilityShares)],
        ['totalNominalAssets', formatUnits(totalNominalAssets, 27)],
        ['totalSupply', formatUnits(totalSupply, 27)],
        [
          'totalUnassignedLiabilityShares',
          formatEther(totalUnassignedLiabilityShares),
        ],
      ],
    });
  });

generateReadCommands(
  StvPoolAbi,
  getStvPoolContract,
  stvPoolRead,
  readCommandConfig,
);
