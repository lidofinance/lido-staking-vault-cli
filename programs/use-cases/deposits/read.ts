import { Hex } from 'viem';
import { Option } from 'commander';

import { getPdgBaseInfo, getPdgRoles, getValidatorStatus } from 'features';
import { getCommandsJson, logInfo } from 'utils';

import { deposits } from './main.js';

const depositsRead = deposits
  .command('read')
  .aliases(['r'])
  .description('vault operations read commands');

depositsRead.addOption(new Option('-cmd2json'));
depositsRead.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(depositsRead));
  process.exit();
});

depositsRead
  .command('info')
  .description('get PredepositGuarantee base info')
  .action(async () => {
    await getPdgBaseInfo();
  });

depositsRead
  .command('roles')
  .description('get PredepositGuarantee roles')
  .action(async () => {
    await getPdgRoles();
  });

depositsRead
  .command('validator-status')
  .aliases(['v-status'])
  .description('get validator status')
  .argument('<validatorPubkey>', 'validator pubkey')
  .action(async (validatorPubkey: Hex) => {
    await getValidatorStatus(validatorPubkey);
  });
