import { type Address } from 'viem';
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
    const contract = getStvStethPoolContract(address);

    const [
      wrapperType,
      DEFAULT_ADMIN_ROLE,
      DEPOSIT_ROLE,
      REQUEST_VALIDATOR_EXIT_ROLE,
      TRIGGER_VALIDATOR_WITHDRAWAL_ROLE,
      ALLOW_LIST_MANAGER_ROLE,
      DASHBOARD,
      STAKING_VAULT,
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
      vaultDisconnected,
      withdrawalQueue,
    ] = await Promise.all([
      callReadMethodSilent(contract, 'wrapperType'),

      callReadMethodSilent(contract, 'DEFAULT_ADMIN_ROLE'),
      callReadMethodSilent(contract, 'DEPOSIT_ROLE'),
      callReadMethodSilent(contract, 'REQUEST_VALIDATOR_EXIT_ROLE'),
      callReadMethodSilent(contract, 'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE'),
      callReadMethodSilent(contract, 'ALLOW_LIST_MANAGER_ROLE'),

      callReadMethodSilent(contract, 'DASHBOARD'),
      callReadMethodSilent(contract, 'STAKING_VAULT'),
      callReadMethodSilent(contract, 'STETH'),
      callReadMethodSilent(contract, 'VAULT_HUB'),
      callReadMethodSilent(contract, 'WITHDRAWAL_QUEUE'),

      callReadMethodSilent(contract, 'ALLOW_LIST_ENABLED'),

      callReadMethodSilent(contract, 'name'),
      callReadMethodSilent(contract, 'symbol'),
      callReadMethodSilent(contract, 'totalAssets'),

      callReadMethodSilent(contract, 'totalExceedingMintedSteth'),
      callReadMethodSilent(contract, 'totalLiabilityShares'),
      callReadMethodSilent(contract, 'totalNominalAssets'),
      callReadMethodSilent(contract, 'totalSupply'),
      callReadMethodSilent(contract, 'totalUnassignedLiabilityShares'),

      callReadMethodSilent(contract, 'vaultDisconnected'),
      callReadMethodSilent(contract, 'withdrawalQueue'),
    ]);

    logResult({
      data: [
        ['wrapperType', wrapperType],
        ['DEFAULT_ADMIN_ROLE', DEFAULT_ADMIN_ROLE],
        ['DEPOSIT_ROLE', DEPOSIT_ROLE],
        ['REQUEST_VALIDATOR_EXIT_ROLE', REQUEST_VALIDATOR_EXIT_ROLE],
        [
          'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE',
          TRIGGER_VALIDATOR_WITHDRAWAL_ROLE,
        ],
        ['ALLOW_LIST_MANAGER_ROLE', ALLOW_LIST_MANAGER_ROLE],
        ['DASHBOARD', DASHBOARD],
        ['STAKING_VAULT', STAKING_VAULT],
        ['STETH', STETH],
        ['VAULT_HUB', VAULT_HUB],
        ['WITHDRAWAL_QUEUE', WITHDRAWAL_QUEUE],
        ['ALLOW_LIST_ENABLED', ALLOW_LIST_ENABLED],
        ['name', name],
        ['symbol', symbol],
        ['totalAssets', totalAssets],
        ['totalExceedingMintedSteth', totalExceedingMintedSteth],
        ['totalLiabilityShares', totalLiabilityShares],
        ['totalNominalAssets', totalNominalAssets],
        ['totalSupply', totalSupply],
        ['totalUnassignedLiabilityShares', totalUnassignedLiabilityShares],
        ['vaultDisconnected', vaultDisconnected],
        ['withdrawalQueue', withdrawalQueue],
      ],
    });
  });

generateReadCommands(
  StvStETHPoolAbi,
  getStvStethPoolContract,
  stvStethPoolRead,
  readCommandConfig,
);
