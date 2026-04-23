import { Option } from 'commander';
import {
  ACCOUNT_GRANT_ARGUMENT,
  ACCOUNT_REVOKE_ARGUMENT,
  executeOperation,
  getPromptTimelock,
  processSalt,
  promptAccount,
  promptRole,
  proposeOperation,
  ROLE_ARGUMENT,
  SALT_OPTION,
  TIMELOCK_ARGUMENT,
} from 'features/defi-wrapper/index.js';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  addressPrompt,
} from 'utils';
import { strategyTimelock } from './main.js';
import { Address, encodeFunctionData } from 'viem';
import { getGenericStrategyContract } from 'contracts/defi-wrapper/generic-strategy.js';

// Common helpers

const STRATEGY_ARGUMENT = [
  '[strategy]',
  'strategy contract address',
  stringToAddress,
] as const;

const promptStrategy = async (strategyAddress?: Address) => {
  if (!strategyAddress) {
    const strategyPrompt = await addressPrompt(
      'Enter strategy contract address',
      'strategy',
    );
    strategyAddress = strategyPrompt.strategy as Address;
  }
  return getGenericStrategyContract(strategyAddress);
};

const createRoleAction = (
  mode: 'propose' | 'execute',
  roleFunction: 'grantRole' | 'revokeRole',
  accountPromptMessage: string,
) => {
  const verb = roleFunction === 'grantRole' ? 'granting' : 'revoking';
  const preposition = roleFunction === 'grantRole' ? 'to' : 'from';
  const timelockFn = mode === 'propose' ? proposeOperation : executeOperation;

  return async (
    timelock?: Address,
    strategyAddress?: Address,
    roleInput?: string,
    accountInput?: string,
    options?: { salt?: string },
  ) => {
    const timelockContract = await getPromptTimelock(timelock);
    const strategyContract = await promptStrategy(strategyAddress);
    const role = await promptRole(roleInput, strategyContract);
    const finalSalt = processSalt(options?.salt);
    const account = await promptAccount(accountInput, accountPromptMessage);

    const data = encodeFunctionData({
      abi: strategyContract.abi,
      functionName: roleFunction,
      args: [role, account],
    });

    await timelockFn(
      timelockContract.address,
      strategyContract.address,
      data,
      finalSalt,
      roleFunction,
      `Are you sure you want to ${mode} ${verb} role ${role} ${preposition} ${account} on strategy ${strategyContract.address}?`,
    );
  };
};

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
    createRoleAction('propose', 'grantRole', 'Enter account address to grant role to'),
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
    createRoleAction('execute', 'grantRole', 'Enter account address to grant role to'),
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
    createRoleAction('propose', 'revokeRole', 'Enter account address to revoke role from'),
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
    createRoleAction('execute', 'revokeRole', 'Enter account address to revoke role from'),
  );
