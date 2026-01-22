import { Option } from 'commander';
import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  callReadMethodSilent,
  addressPrompt,
  textPrompt,
} from 'utils';
import { withdrawalQueue } from './main.js';
import { Address, Hex, encodeFunctionData, stringToHex } from 'viem';
import {
  getTimeLockContract,
  getWithdrawalQueueContract,
} from 'contracts/defi-wrapper/index.js';
import { WithdrawalQueueAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

const withdrawalQueueWrite = withdrawalQueue
  .command('write')
  .alias('w')
  .description('withdrawal queue timelock write commands');

withdrawalQueueWrite.addOption(new Option('-cmd2json'));
withdrawalQueueWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(withdrawalQueueWrite));
  process.exit();
});

// Helper function to resolve role
const resolveRole = async (
  roleInput: string,
  withdrawalQueueAddress: Address,
): Promise<Hex> => {
  if (!roleInput.startsWith('0x')) {
    const withdrawalQueueContract = await getWithdrawalQueueContract(
      withdrawalQueueAddress,
    );
    try {
      const role = (await callReadMethodSilent(
        withdrawalQueueContract,
        roleInput as any,
      )) as Hex;
      logInfo(`Resolved role "${roleInput}" to ${role}`);
      return role;
    } catch {
      throw new Error(
        `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE, FINALIZE_ROLE) or bytes32 hex.`,
      );
    }
  } else {
    return stringToHex(roleInput);
  }
};

// Helper function for propose operations
const proposeOperation = async (
  timelock: Address,
  target: Address,
  data: Hex,
  salt: Hex,
  functionName: string,
  confirmationMessage: string,
): Promise<Hex> => {
  const timelockContract = await getTimeLockContract(timelock);
  const minDelay = await callReadMethodSilent(timelockContract, 'getMinDelay');

  const predecessor =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

  const operationId = await callReadMethodSilent(
    timelockContract,
    'hashOperation',
    [target, 0n, data, predecessor, salt],
  );

  logInfo('Proposing operation:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: 0`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);
  logInfo(`  Function: ${functionName}`);
  logInfo(`  Min delay: ${minDelay} seconds`);

  const confirm = await confirmOperation(confirmationMessage);
  if (!confirm) {
    throw new Error('Operation cancelled by user');
  }

  await callWriteMethodWithReceipt({
    contract: timelockContract,
    methodName: 'schedule',
    payload: [target, 0n, data, predecessor, salt, minDelay],
  });

  logInfo(`✅ Operation proposed successfully!`);
  logInfo(`   Operation ID: ${operationId}`);
  logInfo(`   Execute after: ${minDelay} seconds`);

  return operationId;
};

// Helper function for execute operations
const executeOperation = async (
  timelock: Address,
  target: Address,
  data: Hex,
  salt: Hex,
  functionName: string,
  confirmationMessage: string,
): Promise<void> => {
  const timelockContract = await getTimeLockContract(timelock);
  const predecessor =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

  const operationId = await callReadMethodSilent(
    timelockContract,
    'hashOperation',
    [target, 0n, data, predecessor, salt],
  );

  logInfo('Calculated operation details:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: 0`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);

  const state = await callReadMethodSilent(
    timelockContract,
    'getOperationState',
    [operationId],
  );

  if (state === 0) {
    logInfo('❌ Operation not found (Unset)');
    logInfo(`   Operation ID: ${operationId}`);
    return;
  }
  if (state === 3) {
    logInfo('✅ Operation already executed (Done)');
    return;
  }
  if (state === 1) {
    const timestamp = await callReadMethodSilent(
      timelockContract,
      'getTimestamp',
      [operationId],
    );
    const publicClient = await getPublicClient();
    const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const now = currentBlock.timestamp;
    const waitTime = timestamp > now ? timestamp - now : 0n;
    logInfo(
      `⏳ Operation is waiting. Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
    );
    return;
  }

  logInfo('Executing operation:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Function: ${functionName}`);

  const confirm = await confirmOperation(confirmationMessage);
  if (!confirm) return;

  await callWriteMethodWithReceipt({
    contract: timelockContract,
    methodName: 'execute',
    payload: [target, 0n, data, predecessor, salt],
  });

  logInfo(`✅ Operation executed successfully!`);
  logInfo(`   Operation ID: ${operationId}`);
};

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

      const role = await resolveRole(roleInput, withdrawalQueueAddress);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

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

      const role = await resolveRole(roleInput, withdrawalQueueAddress);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

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

      const role = await resolveRole(roleInput, withdrawalQueueAddress);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

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

      const role = await resolveRole(roleInput, withdrawalQueueAddress);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

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
