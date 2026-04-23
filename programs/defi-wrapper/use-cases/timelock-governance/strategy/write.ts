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
    async (
      timelock?: Address,
      strategyAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const strategyContract = await promptStrategy(strategyAddress);

      const role = await promptRole(roleInput, strategyContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to grant role to',
      );

      // Encode grantRole call
      const data = encodeFunctionData({
        abi: strategyContract.abi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await proposeOperation(
        timelockContract.address,
        strategyContract.address,
        data,
        finalSalt,
        'grantRole',
        `Are you sure you want to propose granting role ${role} to ${account} on strategy ${strategyContract.address}?`,
      );
    },
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
    async (
      timelock?: Address,
      strategyAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const strategyContract = await promptStrategy(strategyAddress);

      const role = await promptRole(roleInput, strategyContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to grant role to',
      );

      // Encode grantRole call (same as in propose)
      const data = encodeFunctionData({
        abi: strategyContract.abi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await executeOperation(
        timelockContract.address,
        strategyContract.address,
        data,
        finalSalt,
        'grantRole',
        `Are you sure you want to execute granting role ${role} to ${account} on strategy ${strategyContract.address}?`,
      );
    },
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
    async (
      timelock?: Address,
      strategyAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const strategyContract = await promptStrategy(strategyAddress);

      const role = await promptRole(roleInput, strategyContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to revoke role from',
      );

      // Encode revokeRole call
      const data = encodeFunctionData({
        abi: strategyContract.abi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await proposeOperation(
        timelockContract.address,
        strategyContract.address,
        data,
        finalSalt,
        'revokeRole',
        `Are you sure you want to propose revoking role ${role} from ${account} on strategy ${strategyContract.address}?`,
      );
    },
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
    async (
      timelock?: Address,
      strategyAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const strategyContract = await promptStrategy(strategyAddress);

      const role = await promptRole(roleInput, strategyContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to revoke role from',
      );

      // Encode revokeRole call
      const data = encodeFunctionData({
        abi: strategyContract.abi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await executeOperation(
        timelockContract.address,
        strategyContract.address,
        data,
        finalSalt,
        'revokeRole',
        `Are you sure you want to execute revoking role ${role} from ${account} on strategy ${strategyContract.address}?`,
      );
    },
  );
