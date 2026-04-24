import { Option } from 'commander';
import { Address, encodeFunctionData, Hex } from 'viem';

import {
  proposeOperation,
  executeOperation,
  TIMELOCK_ARGUMENT,
  getPromptTimelock,
  SALT_OPTION,
  ROLE_ARGUMENT,
  ACCOUNT_GRANT_ARGUMENT,
  ACCOUNT_REVOKE_ARGUMENT,
} from 'features/defi-wrapper/index.js';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  addressPrompt,
  promptRole,
  promptAccount,
  processSalt,
} from 'utils';
import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import { getWithdrawalQueueContract } from 'contracts/defi-wrapper/index.js';

import { withdrawalQueueTimelockGovernance } from './main.js';

// Common helpers

const WITHDRAWAL_QUEUE_ARGUMENT = [
  '[withdrawalQueue]',
  'withdrawal queue contract address',
  stringToAddress,
] as const;

const promptWithdrawalQueue = async (withdrawalQueueAddress?: Address) => {
  if (!withdrawalQueueAddress) {
    const withdrawalQueuePrompt = await addressPrompt(
      'Enter withdrawal queue contract address',
      'withdrawalQueue',
    );
    withdrawalQueueAddress = withdrawalQueuePrompt.withdrawalQueue as Address;
  }
  return getWithdrawalQueueContract(withdrawalQueueAddress);
};

const withdrawalQueueWrite = withdrawalQueueTimelockGovernance
  .command('write')
  .alias('w')
  .description('withdrawal queue timelock write commands');

withdrawalQueueWrite.addOption(new Option('-cmd2json'));
withdrawalQueueWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(withdrawalQueueWrite));
  process.exit();
});

// propose-grant-role
withdrawalQueueWrite
  .command('propose-grant-role')
  .description('propose granting a role on WithdrawalQueue via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...WITHDRAWAL_QUEUE_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_GRANT_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const withdrawalQueueContract = await promptWithdrawalQueue(
        withdrawalQueueAddress,
      );

      const role = await promptRole(roleInput, withdrawalQueueContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to grant role to',
      );

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await proposeOperation(
        timelockContract.address,
        withdrawalQueueContract.address,
        data,
        finalSalt,
        `grantRole(${role}, ${account})`,
        `Are you sure you want to propose granting role ${role} to ${account} on withdrawal queue ${withdrawalQueueContract.address}?`,
      );
    },
  );

// execute-grant-role
withdrawalQueueWrite
  .command('execute-grant-role')
  .description('execute granting a role on WithdrawalQueue via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...WITHDRAWAL_QUEUE_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_GRANT_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const withdrawalQueueContract = await promptWithdrawalQueue(
        withdrawalQueueAddress,
      );

      const role = await promptRole(roleInput, withdrawalQueueContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to grant role to',
      );

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await executeOperation(
        timelockContract.address,
        withdrawalQueueContract.address,
        data,
        finalSalt,
        `grantRole(${role}, ${account})`,
        `Are you sure you want to execute granting role ${role} to ${account} on withdrawal queue ${withdrawalQueueContract.address}?`,
      );
    },
  );

// propose-revoke-role
withdrawalQueueWrite
  .command('propose-revoke-role')
  .description('propose revoking a role on WithdrawalQueue via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...WITHDRAWAL_QUEUE_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_REVOKE_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const withdrawalQueueContract = await promptWithdrawalQueue(
        withdrawalQueueAddress,
      );

      const role = await promptRole(roleInput, withdrawalQueueContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to revoke role from',
      );

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await proposeOperation(
        timelockContract.address,
        withdrawalQueueContract.address,
        data,
        finalSalt,
        `revokeRole(${role}, ${account})`,
        `Are you sure you want to propose revoking role ${role} from ${account} on withdrawal queue ${withdrawalQueueContract.address}?`,
      );
    },
  );

// execute-revoke-role
withdrawalQueueWrite
  .command('execute-revoke-role')
  .description('execute revoking a role on WithdrawalQueue via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...WITHDRAWAL_QUEUE_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_REVOKE_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      const timelockContract = await getPromptTimelock(timelock);
      const withdrawalQueueContract = await promptWithdrawalQueue(
        withdrawalQueueAddress,
      );

      const role = await promptRole(roleInput, withdrawalQueueContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to revoke role from',
      );

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await executeOperation(
        timelockContract.address,
        withdrawalQueueContract.address,
        data,
        finalSalt,
        `revokeRole(${role}, ${account})`,
        `Are you sure you want to execute revoking role ${role} from ${account} on withdrawal queue ${withdrawalQueueContract.address}?`,
      );
    },
  );
