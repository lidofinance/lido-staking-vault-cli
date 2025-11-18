import { type Address } from 'viem';
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
    const contract = getStvPoolContract(address);

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
      callReadMethodSilent(contract, 'poolType'),
      callReadMethodSilent(contract, 'DEFAULT_ADMIN_ROLE'),
      callReadMethodSilent(contract, 'DEPOSIT_ROLE'),
      callReadMethodSilent(contract, 'ALLOW_LIST_MANAGER_ROLE'),

      callReadMethodSilent(contract, 'VAULT'),
      callReadMethodSilent(contract, 'DASHBOARD'),
      callReadMethodSilent(contract, 'STETH'),
      callReadMethodSilent(contract, 'VAULT_HUB'),
      callReadMethodSilent(contract, 'WITHDRAWAL_QUEUE'),
      callReadMethodSilent(contract, 'DISTRIBUTOR'),

      callReadMethodSilent(contract, 'ALLOW_LIST_ENABLED'),

      callReadMethodSilent(contract, 'name'),
      callReadMethodSilent(contract, 'symbol'),
      callReadMethodSilent(contract, 'totalAssets'),

      callReadMethodSilent(contract, 'totalLiabilityShares'),
      callReadMethodSilent(contract, 'totalNominalAssets'),
      callReadMethodSilent(contract, 'totalSupply'),
      callReadMethodSilent(contract, 'totalUnassignedLiabilityShares'),
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
        ['totalAssets', totalAssets],
        ['totalLiabilityShares', totalLiabilityShares],
        ['totalNominalAssets', totalNominalAssets],
        ['totalSupply', totalSupply],
        ['totalUnassignedLiabilityShares', totalUnassignedLiabilityShares],
      ],
    });
  });

generateReadCommands(
  StvPoolAbi,
  getStvPoolContract,
  stvPoolRead,
  readCommandConfig,
);
