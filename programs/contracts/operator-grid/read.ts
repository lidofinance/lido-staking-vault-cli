import { Option } from 'commander';
import type { Address } from 'viem';

import {
  generateReadCommands,
  getCommandsJson,
  logInfo,
  stringToAddress,
  callReadMethodSilent,
  logResult,
} from 'utils';
import { OperatorGridAbi } from 'abi';
import { getOperatorGridContract } from 'contracts';
import { getOperatorGridBaseInfo, getOperatorGridRoles } from 'features';

import { operatorGrid } from './main.js';
import { readCommandConfig } from './config.js';

const operatorGridRead = operatorGrid
  .command('read')
  .aliases(['r'])
  .description('operator grid read commands');

operatorGridRead.addOption(new Option('-cmd2json'));
operatorGridRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(operatorGridRead));
  process.exit();
});

operatorGridRead
  .command('info')
  .description('get operator grid base info')
  .action(async () => {
    await getOperatorGridBaseInfo();
  });

operatorGridRead
  .command('roles')
  .description('get operator grid roles')
  .action(async () => {
    await getOperatorGridRoles();
  });

operatorGridRead
  .command('vault-info')
  .description('get vault info')
  .argument('<vault>', 'vault address', stringToAddress)
  .action(async (vault: Address) => {
    const operatorGridContract = await getOperatorGridContract();

    const result = await callReadMethodSilent(
      operatorGridContract,
      'vaultTierInfo',
      [vault],
    );

    logResult({
      data: [
        ['Node Operator', result[0]],
        ['Tier ID', result[1]],
        ['Share Limit', result[2]],
        ['Reserve Ratio BP', result[3]],
        ['Forced Rebalance Threshold BP', result[4]],
        ['Infra Fee BP', result[5]],
        ['Liquidity Fee BP', result[6]],
        ['Reservation Fee BP', result[7]],
      ],
    });
  });

generateReadCommands(
  OperatorGridAbi,
  getOperatorGridContract,
  operatorGridRead,
  readCommandConfig,
);
