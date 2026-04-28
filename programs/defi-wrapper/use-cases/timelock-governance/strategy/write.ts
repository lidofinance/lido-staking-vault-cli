import { Option } from 'commander';

import {
  ACCOUNT_GRANT_ARGUMENT,
  ACCOUNT_REVOKE_ARGUMENT,
  ROLE_ARGUMENT,
  SALT_OPTION,
  TIMELOCK_ARGUMENT,
  createRoleAction,
} from 'features/defi-wrapper/index.js';
import { logInfo, getCommandsJson, stringToAddress } from 'utils';
import { strategyTimelock } from './main.js';

// Common helpers

const STRATEGY_ARGUMENT = [
  '[strategy]',
  'strategy contract address',
  stringToAddress,
] as const;

// Command definitions

const strategyWrite = strategyTimelock
  .command('write')
  .alias('w')
  .description('strategy timelock write commands');

strategyWrite.addOption(new Option('-cmd2json'));
strategyWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(strategyWrite));
  process.exit();
});

strategyWrite
  .command('propose-grant-role')
  .description('propose granting a role on Strategy via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...STRATEGY_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_GRANT_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    createRoleAction(
      'propose',
      'grantRole',
      'Enter account address to grant role to',
    ),
  );

strategyWrite
  .command('execute-grant-role')
  .description('execute granting a role on Strategy via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...STRATEGY_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_GRANT_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    createRoleAction(
      'execute',
      'grantRole',
      'Enter account address to grant role to',
    ),
  );

strategyWrite
  .command('propose-revoke-role')
  .description('propose revoking a role on Strategy via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...STRATEGY_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_REVOKE_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    createRoleAction(
      'propose',
      'revokeRole',
      'Enter account address to revoke role from',
    ),
  );

strategyWrite
  .command('execute-revoke-role')
  .description('execute revoking a role on Strategy via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...STRATEGY_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_REVOKE_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    createRoleAction(
      'execute',
      'revokeRole',
      'Enter account address to revoke role from',
    ),
  );
