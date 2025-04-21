import { Option } from 'commander';

import { generateReadCommands, getCommandsJson, logInfo } from 'utils';
import { getPredepositGuaranteeContract } from 'contracts';
import { PredepositGuaranteeAbi } from 'abi';
import { getPdgBaseInfo, getPdgRoles } from 'features';

import { pdg } from './main.js';
import { readCommandConfig } from './config.js';

const pdgRead = pdg
  .command('read')
  .aliases(['r'])
  .description('pdg read commands');

pdgRead.addOption(new Option('-cmd2json'));
pdgRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(pdgRead));
  process.exit();
});

pdgRead.command('info').action(async () => {
  await getPdgBaseInfo();
});

pdgRead.command('roles').action(async () => {
  await getPdgRoles();
});

generateReadCommands(
  PredepositGuaranteeAbi,
  getPredepositGuaranteeContract,
  pdgRead,
  readCommandConfig,
);
