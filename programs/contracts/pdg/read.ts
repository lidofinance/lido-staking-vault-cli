import { Option } from 'commander';
import { Hex } from 'viem';

import { generateReadCommands, getCommandsJson, logInfo } from 'utils';
import { getPredepositGuaranteeContract } from 'contracts';
import { PredepositGuaranteeAbi } from 'abi';
import { getPdgBaseInfo, getPdgRoles, getValidatorStatus } from 'features';

import { pdg } from './main.js';
import { readCommandConfig } from './config.js';

const pdgRead = pdg
  .command('read')
  .aliases(['r'])
  .description('PredepositGuarantee read commands');

pdgRead.addOption(new Option('-cmd2json'));
pdgRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(pdgRead));
  process.exit();
});

pdgRead
  .command('info')
  .description('get PredepositGuarantee base info')
  .action(async () => {
    await getPdgBaseInfo();
  });

pdgRead
  .command('roles')
  .description('get PredepositGuarantee roles')
  .action(async () => {
    await getPdgRoles();
  });

pdgRead
  .command('validator-status')
  .aliases(['v-status'])
  .description('get validator status')
  .argument('<validatorPubkey>', 'validator pubkey')
  .action(async (validatorPubkey: Hex) => {
    await getValidatorStatus(validatorPubkey);
  });

generateReadCommands(
  PredepositGuaranteeAbi,
  getPredepositGuaranteeContract,
  pdgRead,
  readCommandConfig,
);
