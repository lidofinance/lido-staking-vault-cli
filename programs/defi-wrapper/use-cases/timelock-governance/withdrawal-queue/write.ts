import { Option } from 'commander';
import {
  proposeOperation,
  executeOperation,
  resolveRole,
  processSalt,
} from 'features/defi-wrapper/index.js';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  addressPrompt,
  textPrompt,
} from 'utils';
import { withdrawalQueueTimelockGovernance } from './main.js';
import { Address, encodeFunctionData } from 'viem';
import { getWithdrawalQueueContract } from 'contracts/defi-wrapper/index.js';
import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';

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
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument(
    '[withdrawalQueue]',
    'withdrawal queue contract address',
    stringToAddress,
  )
  .argument(
    '[role]',
    'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
  )
  .argument('[account]', 'account address to grant role to')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!withdrawalQueueAddress) {
        const withdrawalQueuePrompt = await addressPrompt(
          'Enter withdrawal queue contract address',
          'withdrawalQueue',
        );
        withdrawalQueueAddress =
          withdrawalQueuePrompt.withdrawalQueue as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(
        roleInput,
        withdrawalQueueAddress,
        getWithdrawalQueueContract,
      );

      const finalSalt = processSalt(options?.salt);

      let account: Address;
      if (!accountInput) {
        const accountPrompt = await addressPrompt(
          'Enter account address to grant role to',
          'account',
        );
        account = accountPrompt.account as Address;
      } else {
        account = stringToAddress(accountInput);
      }

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await proposeOperation(
        timelock,
        withdrawalQueueAddress,
        data,
        finalSalt,
        `grantRole(${role}, ${account})`,
        `Are you sure you want to propose granting role ${role} to ${account} on withdrawal queue ${withdrawalQueueAddress}?`,
      );
    },
  );

// execute-grant-role
withdrawalQueueWrite
  .command('execute-grant-role')
  .description('execute granting a role on WithdrawalQueue via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument(
    '[withdrawalQueue]',
    'withdrawal queue contract address',
    stringToAddress,
  )
  .argument(
    '[role]',
    'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
  )
  .argument('[account]', 'account address to grant role to')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!withdrawalQueueAddress) {
        const withdrawalQueuePrompt = await addressPrompt(
          'Enter withdrawal queue contract address',
          'withdrawalQueue',
        );
        withdrawalQueueAddress =
          withdrawalQueuePrompt.withdrawalQueue as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(
        roleInput,
        withdrawalQueueAddress,
        getWithdrawalQueueContract,
      );

      const finalSalt = processSalt(options?.salt);

      let account: Address;
      if (!accountInput) {
        const accountPrompt = await addressPrompt(
          'Enter account address to grant role to',
          'account',
        );
        account = accountPrompt.account as Address;
      } else {
        account = stringToAddress(accountInput);
      }

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await executeOperation(
        timelock,
        withdrawalQueueAddress,
        data,
        finalSalt,
        `grantRole(${role}, ${account})`,
        `Are you sure you want to execute granting role ${role} to ${account} on withdrawal queue ${withdrawalQueueAddress}?`,
      );
    },
  );

// propose-revoke-role
withdrawalQueueWrite
  .command('propose-revoke-role')
  .description('propose revoking a role on WithdrawalQueue via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument(
    '[withdrawalQueue]',
    'withdrawal queue contract address',
    stringToAddress,
  )
  .argument(
    '[role]',
    'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
  )
  .argument('[account]', 'account address to revoke role from')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!withdrawalQueueAddress) {
        const withdrawalQueuePrompt = await addressPrompt(
          'Enter withdrawal queue contract address',
          'withdrawalQueue',
        );
        withdrawalQueueAddress =
          withdrawalQueuePrompt.withdrawalQueue as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(
        roleInput,
        withdrawalQueueAddress,
        getWithdrawalQueueContract,
      );

      const finalSalt = processSalt(options?.salt);

      let account: Address;
      if (!accountInput) {
        const accountPrompt = await addressPrompt(
          'Enter account address to revoke role from',
          'account',
        );
        account = accountPrompt.account as Address;
      } else {
        account = stringToAddress(accountInput);
      }

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await proposeOperation(
        timelock,
        withdrawalQueueAddress,
        data,
        finalSalt,
        `revokeRole(${role}, ${account})`,
        `Are you sure you want to propose revoking role ${role} from ${account} on withdrawal queue ${withdrawalQueueAddress}?`,
      );
    },
  );

// execute-revoke-role
withdrawalQueueWrite
  .command('execute-revoke-role')
  .description('execute revoking a role on WithdrawalQueue via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument(
    '[withdrawalQueue]',
    'withdrawal queue contract address',
    stringToAddress,
  )
  .argument(
    '[role]',
    'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
  )
  .argument('[account]', 'account address to revoke role from')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      withdrawalQueueAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!withdrawalQueueAddress) {
        const withdrawalQueuePrompt = await addressPrompt(
          'Enter withdrawal queue contract address',
          'withdrawalQueue',
        );
        withdrawalQueueAddress =
          withdrawalQueuePrompt.withdrawalQueue as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE, FINALIZE_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(
        roleInput,
        withdrawalQueueAddress,
        getWithdrawalQueueContract,
      );

      const finalSalt = processSalt(options?.salt);

      let account: Address;
      if (!accountInput) {
        const accountPrompt = await addressPrompt(
          'Enter account address to revoke role from',
          'account',
        );
        account = accountPrompt.account as Address;
      } else {
        account = stringToAddress(accountInput);
      }

      const data = encodeFunctionData({
        abi: WithdrawalQueueAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await executeOperation(
        timelock,
        withdrawalQueueAddress,
        data,
        finalSalt,
        `revokeRole(${role}, ${account})`,
        `Are you sure you want to execute revoking role ${role} from ${account} on withdrawal queue ${withdrawalQueueAddress}?`,
      );
    },
  );
