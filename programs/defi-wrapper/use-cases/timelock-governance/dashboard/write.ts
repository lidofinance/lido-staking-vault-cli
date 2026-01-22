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
import { dashboardTimelockGovernance } from './main.js';
import { Address, Hex, encodeFunctionData, stringToHex } from 'viem';
import { getTimeLockContract } from 'contracts/defi-wrapper/index.js';
import { getDashboardContract } from 'contracts/index.js';
import { DashboardAbi } from 'abi/index.js';
import { getPublicClient } from 'providers';

const dashboardWrite = dashboardTimelockGovernance
  .command('write')
  .alias('w')
  .description('dashboard timelock write commands');

dashboardWrite.addOption(new Option('-cmd2json'));
dashboardWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboardWrite));
  process.exit();
});

// Helper function to resolve role
const resolveRole = async (
  roleInput: string,
  dashboardAddress: Address,
): Promise<Hex> => {
  if (!roleInput.startsWith('0x')) {
    const dashboardContract = await getDashboardContract(dashboardAddress);
    try {
      const role = (await callReadMethodSilent({
        contract: dashboardContract,
        methodName: roleInput as any,
        payload: [],
      })) as Hex;
      logInfo(`Resolved role "${roleInput}" to ${role}`);
      return role;
    } catch {
      throw new Error(
        `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE) or bytes32 hex.`,
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
  const minDelay = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'getMinDelay',
    payload: [],
  });

  const predecessor =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

  const operationId = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'hashOperation',
    payload: [[target, 0n, data, predecessor, salt]],
  });

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

  const operationId = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'hashOperation',
    payload: [[target, 0n, data, predecessor, salt]],
  });

  logInfo('Calculated operation details:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: 0`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);

  const state = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'getOperationState',
    payload: [[operationId]],
  });

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
    const timestamp = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'getTimestamp',
      payload: [[operationId]],
    });
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
dashboardWrite
  .command('propose-grant-role')
  .description('propose granting a role on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to grant role to')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
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

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(roleInput, dashboardAddress);

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
        abi: DashboardAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await proposeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `grantRole(${role}, ${account})`,
        `Are you sure you want to propose granting role ${role} to ${account} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// execute-grant-role
dashboardWrite
  .command('execute-grant-role')
  .description('execute granting a role on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to grant role to')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
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

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(roleInput, dashboardAddress);

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
        abi: DashboardAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await executeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `grantRole(${role}, ${account})`,
        `Are you sure you want to execute granting role ${role} to ${account} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// propose-revoke-role
dashboardWrite
  .command('propose-revoke-role')
  .description('propose revoking a role on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to revoke role from')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
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

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(roleInput, dashboardAddress);

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
        abi: DashboardAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await proposeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `revokeRole(${role}, ${account})`,
        `Are you sure you want to propose revoking role ${role} from ${account} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// execute-revoke-role
dashboardWrite
  .command('execute-revoke-role')
  .description('execute revoking a role on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to revoke role from')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
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

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      const role = await resolveRole(roleInput, dashboardAddress);

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
        abi: DashboardAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await executeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `revokeRole(${role}, ${account})`,
        `Are you sure you want to execute revoking role ${role} from ${account} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// propose-change-tier
dashboardWrite
  .command('propose-change-tier')
  .description('propose changing tier on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[tierId]', 'tier ID (uint256)')
  .argument('[shareLimit]', 'share limit (uint256)')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      tierIdInput?: string,
      shareLimitInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!tierIdInput) {
        const tierIdPrompt = await textPrompt(
          'Enter tier ID (uint256)',
          'tierId',
        );
        tierIdInput = tierIdPrompt.tierId as string;
      }

      if (!shareLimitInput) {
        const shareLimitPrompt = await textPrompt(
          'Enter share limit (uint256)',
          'shareLimit',
        );
        shareLimitInput = shareLimitPrompt.shareLimit as string;
      }

      const tierId = BigInt(tierIdInput);
      const shareLimit = BigInt(shareLimitInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'changeTier',
        args: [tierId, shareLimit],
      });

      await proposeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `changeTier(${tierId}, ${shareLimit})`,
        `Are you sure you want to propose changing tier ${tierId} with share limit ${shareLimit} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// execute-change-tier
dashboardWrite
  .command('execute-change-tier')
  .description('execute changing tier on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[tierId]', 'tier ID (uint256)')
  .argument('[shareLimit]', 'share limit (uint256)')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      tierIdInput?: string,
      shareLimitInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!tierIdInput) {
        const tierIdPrompt = await textPrompt(
          'Enter tier ID (uint256)',
          'tierId',
        );
        tierIdInput = tierIdPrompt.tierId as string;
      }

      if (!shareLimitInput) {
        const shareLimitPrompt = await textPrompt(
          'Enter share limit (uint256)',
          'shareLimit',
        );
        shareLimitInput = shareLimitPrompt.shareLimit as string;
      }

      const tierId = BigInt(tierIdInput);
      const shareLimit = BigInt(shareLimitInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'changeTier',
        args: [tierId, shareLimit],
      });

      await executeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `changeTier(${tierId}, ${shareLimit})`,
        `Are you sure you want to execute changing tier ${tierId} with share limit ${shareLimit} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// propose-sync-tier
dashboardWrite
  .command('propose-sync-tier')
  .description('propose syncing tier on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'syncTier',
        args: [],
      });

      await proposeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        'syncTier()',
        `Are you sure you want to propose syncing tier on dashboard ${dashboardAddress}?`,
      );
    },
  );

// execute-sync-tier
dashboardWrite
  .command('execute-sync-tier')
  .description('execute syncing tier on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'syncTier',
        args: [],
      });

      await executeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        'syncTier()',
        `Are you sure you want to execute syncing tier on dashboard ${dashboardAddress}?`,
      );
    },
  );

// propose-update-share-limit
dashboardWrite
  .command('propose-update-share-limit')
  .description('propose updating share limit on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[shareLimit]', 'share limit (uint256)')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      shareLimitInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!shareLimitInput) {
        const shareLimitPrompt = await textPrompt(
          'Enter share limit (uint256)',
          'shareLimit',
        );
        shareLimitInput = shareLimitPrompt.shareLimit as string;
      }

      const shareLimit = BigInt(shareLimitInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'updateShareLimit',
        args: [shareLimit],
      });

      await proposeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `updateShareLimit(${shareLimit})`,
        `Are you sure you want to propose updating share limit to ${shareLimit} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// execute-update-share-limit
dashboardWrite
  .command('execute-update-share-limit')
  .description('execute updating share limit on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[shareLimit]', 'share limit (uint256)')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      shareLimitInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!shareLimitInput) {
        const shareLimitPrompt = await textPrompt(
          'Enter share limit (uint256)',
          'shareLimit',
        );
        shareLimitInput = shareLimitPrompt.shareLimit as string;
      }

      const shareLimit = BigInt(shareLimitInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'updateShareLimit',
        args: [shareLimit],
      });

      await executeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `updateShareLimit(${shareLimit})`,
        `Are you sure you want to execute updating share limit to ${shareLimit} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// propose-set-pdg-policy
dashboardWrite
  .command('propose-set-pdg-policy')
  .description(
    'propose setting PDG policy on Dashboard via Timelock (0=STRICT, 1=ALLOW_PROVE, 2=ALLOW_DEPOSIT_AND_PROVE)',
  )
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument(
    '[policy]',
    'PDG policy (uint8: 0=STRICT, 1=ALLOW_PROVE, 2=ALLOW_DEPOSIT_AND_PROVE)',
  )
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      policyInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!policyInput) {
        const policyPrompt = await textPrompt(
          'Enter PDG policy (uint8: 0=STRICT, 1=ALLOW_PROVE, 2=ALLOW_DEPOSIT_AND_PROVE)',
          'policy',
        );
        policyInput = policyPrompt.policy as string;
      }

      const policy = Number(policyInput);
      if (policy < 0 || policy > 2) {
        throw new Error('PDG policy must be 0, 1, or 2');
      }

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'setPDGPolicy',
        args: [policy],
      });

      const policyNames = ['STRICT', 'ALLOW_PROVE', 'ALLOW_DEPOSIT_AND_PROVE'];
      await proposeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `setPDGPolicy(${policy})`,
        `Are you sure you want to propose setting PDG policy to ${policy} (${policyNames[policy]}) on dashboard ${dashboardAddress}?`,
      );
    },
  );

// execute-set-pdg-policy
dashboardWrite
  .command('execute-set-pdg-policy')
  .description('execute setting PDG policy on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument(
    '[policy]',
    'PDG policy (uint8: 0=STRICT, 1=ALLOW_PROVE, 2=ALLOW_DEPOSIT_AND_PROVE)',
  )
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      policyInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!policyInput) {
        const policyPrompt = await textPrompt(
          'Enter PDG policy (uint8: 0=STRICT, 1=ALLOW_PROVE, 2=ALLOW_DEPOSIT_AND_PROVE)',
          'policy',
        );
        policyInput = policyPrompt.policy as string;
      }

      const policy = Number(policyInput);
      if (policy < 0 || policy > 2) {
        throw new Error('PDG policy must be 0, 1, or 2');
      }

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'setPDGPolicy',
        args: [policy],
      });

      const policyNames = ['STRICT', 'ALLOW_PROVE', 'ALLOW_DEPOSIT_AND_PROVE'];
      await executeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `setPDGPolicy(${policy})`,
        `Are you sure you want to execute setting PDG policy to ${policy} (${policyNames[policy]}) on dashboard ${dashboardAddress}?`,
      );
    },
  );

// propose-transfer-vault-ownership
dashboardWrite
  .command('propose-transfer-vault-ownership')
  .description('propose transferring vault ownership on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[newOwner]', 'new owner address')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      newOwnerInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!newOwnerInput) {
        const newOwnerPrompt = await addressPrompt(
          'Enter new owner address',
          'newOwner',
        );
        newOwnerInput = newOwnerPrompt.newOwner as string;
      }

      const newOwner = stringToAddress(newOwnerInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'transferVaultOwnership',
        args: [newOwner],
      });

      logInfo(
        '⚠️  WARNING: transferVaultOwnership requires confirmation through confirmingRoles()',
      );
      await proposeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `transferVaultOwnership(${newOwner})`,
        `Are you sure you want to propose transferring vault ownership to ${newOwner} on dashboard ${dashboardAddress}?`,
      );
    },
  );

// execute-transfer-vault-ownership
dashboardWrite
  .command('execute-transfer-vault-ownership')
  .description('execute transferring vault ownership on Dashboard via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[dashboard]', 'dashboard contract address', stringToAddress)
  .argument('[newOwner]', 'new owner address')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      dashboardAddress?: Address,
      newOwnerInput?: string,
      options?: { salt?: string },
    ) => {
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!dashboardAddress) {
        const dashboardPrompt = await addressPrompt(
          'Enter dashboard contract address',
          'dashboard',
        );
        dashboardAddress = dashboardPrompt.dashboard as Address;
      }

      if (!newOwnerInput) {
        const newOwnerPrompt = await addressPrompt(
          'Enter new owner address',
          'newOwner',
        );
        newOwnerInput = newOwnerPrompt.newOwner as string;
      }

      const newOwner = stringToAddress(newOwnerInput);

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const data = encodeFunctionData({
        abi: DashboardAbi,
        functionName: 'transferVaultOwnership',
        args: [newOwner],
      });

      logInfo(
        '⚠️  WARNING: transferVaultOwnership requires confirmation through confirmingRoles()',
      );
      await executeOperation(
        timelock,
        dashboardAddress,
        data,
        finalSalt,
        `transferVaultOwnership(${newOwner})`,
        `Are you sure you want to execute transferring vault ownership to ${newOwner} on dashboard ${dashboardAddress}?`,
      );
    },
  );
