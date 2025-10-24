import { type Address } from 'viem';
import { Option } from 'commander';

import { DistributorAbi } from 'abi/defi-wrapper/index.js';
import { getDistributorContract } from 'contracts/defi-wrapper/index.js';
import {
  generateReadCommands,
  logInfo,
  getCommandsJson,
  stringToAddress,
  callReadMethodSilent,
  logResult,
} from 'utils';

import { distributor } from './main.js';
import { readCommandConfig } from './config.js';

const distributorRead = distributor
  .command('read')
  .alias('r')
  .description('read commands');

distributorRead.addOption(new Option('-cmd2json'));
distributorRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(distributorRead));
  process.exit();
});

distributorRead
  .command('info')
  .description('get distributor base info')
  .argument('<address>', 'distributor address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDistributorContract(address);

    const [DEFAULT_ADMIN_ROLE, MANAGER_ROLE, cid, root, lastProcessedBlock] =
      await Promise.all([
        callReadMethodSilent(contract, 'DEFAULT_ADMIN_ROLE'),
        callReadMethodSilent(contract, 'MANAGER_ROLE'),
        callReadMethodSilent(contract, 'cid'),
        callReadMethodSilent(contract, 'root'),
        callReadMethodSilent(contract, 'lastProcessedBlock'),
      ]);

    logResult({
      data: [
        ['DEFAULT_ADMIN_ROLE', DEFAULT_ADMIN_ROLE],
        ['MANAGER_ROLE', MANAGER_ROLE],
        ['cid', cid],
        ['root', root],
        ['lastProcessedBlock', lastProcessedBlock],
      ],
    });
  });

generateReadCommands(
  DistributorAbi,
  getDistributorContract,
  distributorRead,
  readCommandConfig,
);
