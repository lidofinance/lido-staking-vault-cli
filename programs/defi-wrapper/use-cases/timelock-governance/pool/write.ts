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
import { pool } from './main.js';
import { Address, Hex, encodeFunctionData, stringToHex } from 'viem';
import {
  getTimeLockContract,
  getStvPoolContract,
} from 'contracts/defi-wrapper/index.js';
import { StvPoolAbi, StvStETHPoolAbi } from 'abi/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

const poolWrite = pool
  .command('write')
  .alias('w')
  .description('pool timelock write commands');

poolWrite.addOption(new Option('-cmd2json'));
poolWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(poolWrite));
  process.exit();
});

poolWrite
  .command('propose-grant-role')
  .description('propose granting a role on Pool via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[pool]', 'pool contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to grant role to')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!poolAddress) {
        const poolPrompt = await addressPrompt(
          'Enter pool contract address',
          'pool',
        );
        poolAddress = poolPrompt.pool as Address;
      }

      // Resolve role
      let role: Hex;
      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      // If it's a role name, try to get it from the pool contract
      if (!roleInput.startsWith('0x')) {
        const poolContract = await getStvPoolContract(poolAddress);
        try {
          role = (await callReadMethodSilent({
            contract: poolContract,
            methodName: roleInput as any,
            payload: [],
          })) as Hex;
          logInfo(`Resolved role "${roleInput}" to ${role}`);
        } catch {
          throw new Error(
            `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE) or bytes32 hex.`,
          );
        }
      } else {
        role = stringToHex(roleInput);
      }

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

      const timelockContract = await getTimeLockContract(timelock);

      // Get min delay
      const minDelay = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'getMinDelay',
        payload: [],
      });

      // Encode grantRole call
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      const predecessor =
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

      // Calculate operation ID
      const operationId = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'hashOperation',
        payload: [[poolAddress, 0n, data, predecessor, finalSalt]],
      });
      logInfo('Proposing operation:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Value: 0`);
      logInfo(`  Payload: ${data}`);
      logInfo(`  Predecessor: ${predecessor}`);
      logInfo(`  Salt: ${finalSalt}`);
      logInfo(`  Function: grantRole(${role}, ${account})`);
      logInfo(`  Min delay: ${minDelay} seconds`);

      const confirmationMessage = `Are you sure you want to propose granting role ${role} to ${account} on pool ${poolAddress}?`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: timelockContract,
        methodName: 'schedule',
        payload: [poolAddress, 0n, data, predecessor, finalSalt, minDelay],
      });

      logInfo(`✅ Operation proposed successfully!`);
      logInfo(`   Operation ID: ${operationId}`);
      logInfo(`   Execute after: ${minDelay} seconds`);
    },
  );

poolWrite
  .command('execute-grant-role')
  .description('execute granting a role on Pool via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[pool]', 'pool contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to grant role to')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!poolAddress) {
        const poolPrompt = await addressPrompt(
          'Enter pool contract address',
          'pool',
        );
        poolAddress = poolPrompt.pool as Address;
      }

      // Resolve role
      let role: Hex;
      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      // If it's a role name, try to get it from the pool contract
      if (!roleInput.startsWith('0x')) {
        const poolContract = await getStvPoolContract(poolAddress);
        try {
          role = (await callReadMethodSilent({
            contract: poolContract,
            methodName: roleInput as any,
            payload: [],
          })) as Hex;
          logInfo(`Resolved role "${roleInput}" to ${role}`);
        } catch {
          throw new Error(
            `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE) or bytes32 hex.`,
          );
        }
      } else {
        role = stringToHex(roleInput);
      }

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

      const timelockContract = await getTimeLockContract(timelock);

      // Encode grantRole call (same as in propose)
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      const predecessor =
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

      // Calculate operation ID (must match the one from schedule)
      const operationId = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'hashOperation',
        payload: [[poolAddress, 0n, data, predecessor, finalSalt]],
      });

      logInfo('Calculated operation details:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Value: 0`);
      logInfo(`  Payload: ${data}`);
      logInfo(`  Predecessor: ${predecessor}`);
      logInfo(`  Salt: ${finalSalt}`);

      // Check operation state
      const state = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'getOperationState',
        payload: [[operationId]],
      });
      // OperationState: Unset=0, Waiting=1, Ready=2, Done=3
      if (state === 0) {
        logInfo('❌ Operation not found (Unset)');
        logInfo(`   Operation ID: ${operationId}`);
        logInfo(
          `   Make sure you used the same parameters (pool, role, account, salt) as in propose-grant-role`,
        );
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
        const currentBlock = await publicClient.getBlock({
          blockTag: 'latest',
        });
        const now = currentBlock.timestamp;
        const waitTime = timestamp > now ? timestamp - now : 0n;
        logInfo(
          `⏳ Operation is waiting. Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
        );
        return;
      }

      logInfo('Executing operation:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Function: grantRole(${role}, ${account})`);

      const confirmationMessage = `Are you sure you want to execute granting role ${role} to ${account} on pool ${poolAddress}?`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: timelockContract,
        methodName: 'execute',
        payload: [poolAddress, 0n, data, predecessor, finalSalt],
      });

      logInfo(`✅ Operation executed successfully!`);
      logInfo(`   Operation ID: ${operationId}`);
    },
  );

poolWrite
  .command('propose-revoke-role')
  .description('propose revoking a role on Pool via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[pool]', 'pool contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to revoke role from')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!poolAddress) {
        const poolPrompt = await addressPrompt(
          'Enter pool contract address',
          'pool',
        );
        poolAddress = poolPrompt.pool as Address;
      }

      // Resolve role
      let role: Hex;
      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      // If it's a role name, try to get it from the pool contract
      if (!roleInput.startsWith('0x')) {
        const poolContract = await getStvPoolContract(poolAddress);
        try {
          role = (await callReadMethodSilent({
            contract: poolContract,
            methodName: roleInput as any,
            payload: [],
          })) as Hex;
          logInfo(`Resolved role "${roleInput}" to ${role}`);
        } catch {
          throw new Error(
            `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE) or bytes32 hex.`,
          );
        }
      } else {
        role = stringToHex(roleInput);
      }

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

      const timelockContract = await getTimeLockContract(timelock);

      // Get min delay
      const minDelay = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'getMinDelay',
        payload: [],
      });

      // Encode revokeRole call
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      const predecessor =
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

      // Calculate operation ID
      const operationId = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'hashOperation',
        payload: [[poolAddress, 0n, data, predecessor, finalSalt]],
      });
      logInfo('Proposing operation:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Value: 0`);
      logInfo(`  Payload: ${data}`);
      logInfo(`  Predecessor: ${predecessor}`);
      logInfo(`  Salt: ${finalSalt}`);
      logInfo(`  Function: revokeRole(${role}, ${account})`);
      logInfo(`  Min delay: ${minDelay} seconds`);

      const confirmationMessage = `Are you sure you want to propose revoking role ${role} from ${account} on pool ${poolAddress}?`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: timelockContract,
        methodName: 'schedule',
        payload: [poolAddress, 0n, data, predecessor, finalSalt, minDelay],
      });

      logInfo(`✅ Operation proposed successfully!`);
      logInfo(`   Operation ID: ${operationId}`);
      logInfo(`   Execute after: ${minDelay} seconds`);
    },
  );

poolWrite
  .command('execute-revoke-role')
  .description('execute revoking a role on Pool via Timelock')
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[pool]', 'pool contract address', stringToAddress)
  .argument('[role]', 'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)')
  .argument('[account]', 'account address to revoke role from')
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!poolAddress) {
        const poolPrompt = await addressPrompt(
          'Enter pool contract address',
          'pool',
        );
        poolAddress = poolPrompt.pool as Address;
      }

      // Resolve role
      let role: Hex;
      if (!roleInput) {
        const rolePrompt = await textPrompt(
          'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
          'role',
        );
        roleInput = rolePrompt.role as string;
      }

      // If it's a role name, try to get it from the pool contract
      if (!roleInput.startsWith('0x')) {
        const poolContract = await getStvPoolContract(poolAddress);
        try {
          role = (await callReadMethodSilent({
            contract: poolContract,
            methodName: roleInput as any,
            payload: [],
          })) as Hex;
          logInfo(`Resolved role "${roleInput}" to ${role}`);
        } catch {
          throw new Error(
            `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE) or bytes32 hex.`,
          );
        }
      } else {
        role = stringToHex(roleInput);
      }

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

      const timelockContract = await getTimeLockContract(timelock);

      // Encode revokeRole call (same as in propose)
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      const predecessor =
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

      // Calculate operation ID (must match the one from schedule)
      const operationId = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'hashOperation',
        payload: [[poolAddress, 0n, data, predecessor, finalSalt]],
      });
      logInfo('Calculated operation details:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Value: 0`);
      logInfo(`  Payload: ${data}`);
      logInfo(`  Predecessor: ${predecessor}`);
      logInfo(`  Salt: ${finalSalt}`);

      // Check operation state
      const state = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'getOperationState',
        payload: [[operationId]],
      });

      // OperationState: Unset=0, Waiting=1, Ready=2, Done=3
      if (state === 0) {
        logInfo('❌ Operation not found (Unset)');
        logInfo(`   Operation ID: ${operationId}`);
        logInfo(
          `   Make sure you used the same parameters (pool, role, account, salt) as in propose-revoke-role`,
        );
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
        const currentBlock = await publicClient.getBlock({
          blockTag: 'latest',
        });
        const now = currentBlock.timestamp;
        const waitTime = timestamp > now ? timestamp - now : 0n;
        logInfo(
          `⏳ Operation is waiting. Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
        );
        return;
      }

      logInfo('Executing operation:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Function: revokeRole(${role}, ${account})`);

      const confirmationMessage = `Are you sure you want to execute revoking role ${role} from ${account} on pool ${poolAddress}?`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: timelockContract,
        methodName: 'execute',
        payload: [poolAddress, 0n, data, predecessor, finalSalt],
      });

      logInfo(`✅ Operation executed successfully!`);
      logInfo(`   Operation ID: ${operationId}`);
    },
  );

poolWrite
  .command('propose-set-max-loss-socialization-bp')
  .description(
    'propose setting maxLossSocializationBP on StvStETHPool via Timelock',
  )
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[pool]', 'pool contract address (StvStETHPool)', stringToAddress)
  .argument(
    '[maxSocializablePortionBP]',
    'max socializable portion in basis points (uint16)',
    (v) => (v ? Number(v) : undefined),
  )
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      maxSocializablePortionBPInput?: number,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!poolAddress) {
        const poolPrompt = await addressPrompt(
          'Enter pool contract address',
          'pool',
        );
        poolAddress = poolPrompt.pool as Address;
      }

      let maxSocializablePortionBP: number;
      if (maxSocializablePortionBPInput === undefined) {
        const bpPrompt = await textPrompt(
          'Enter max socializable portion in basis points (uint16, e.g., 100 = 1%)',
          'maxSocializablePortionBP',
        );
        maxSocializablePortionBP = Number(bpPrompt.maxSocializablePortionBP);
      } else {
        maxSocializablePortionBP = maxSocializablePortionBPInput;
      }

      if (maxSocializablePortionBP < 0 || maxSocializablePortionBP > 65535) {
        throw new Error(
          'maxSocializablePortionBP must be between 0 and 65535 (uint16)',
        );
      }

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const timelockContract = await getTimeLockContract(timelock);

      // Get min delay
      const minDelay = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'getMinDelay',
        payload: [],
      });

      // Encode setMaxLossSocializationBP call
      const data = encodeFunctionData({
        abi: StvStETHPoolAbi,
        functionName: 'setMaxLossSocializationBP',
        args: [maxSocializablePortionBP],
      });

      const predecessor =
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

      // Calculate operation ID
      const operationId = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'hashOperation',
        payload: [[poolAddress, 0n, data, predecessor, finalSalt]],
      });
      logInfo('Proposing operation:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Value: 0`);
      logInfo(`  Payload: ${data}`);
      logInfo(`  Predecessor: ${predecessor}`);
      logInfo(`  Salt: ${finalSalt}`);
      logInfo(
        `  Function: setMaxLossSocializationBP(${maxSocializablePortionBP})`,
      );
      logInfo(`  Min delay: ${minDelay} seconds`);

      const confirmationMessage = `Are you sure you want to propose setting maxLossSocializationBP to ${maxSocializablePortionBP} BP on pool ${poolAddress}?`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: timelockContract,
        methodName: 'schedule',
        payload: [poolAddress, 0n, data, predecessor, finalSalt, minDelay],
      });

      logInfo(`✅ Operation proposed successfully!`);
      logInfo(`   Operation ID: ${operationId}`);
      logInfo(`   Execute after: ${minDelay} seconds`);
    },
  );

poolWrite
  .command('execute-set-max-loss-socialization-bp')
  .description(
    'execute setting maxLossSocializationBP on StvStETHPool via Timelock',
  )
  .argument('[timelock]', 'timelock contract address', stringToAddress)
  .argument('[pool]', 'pool contract address (StvStETHPool)', stringToAddress)
  .argument(
    '[maxSocializablePortionBP]',
    'max socializable portion in basis points (uint16)',
    (v) => (v ? Number(v) : undefined),
  )
  .option('-s, --salt <salt>', 'salt for operation (bytes32 hex, default: 0x0)')
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      maxSocializablePortionBPInput?: number,
      options?: { salt?: string },
    ) => {
      // Interactive prompts for missing parameters
      if (!timelock) {
        const timelockPrompt = await addressPrompt(
          'Enter timelock contract address',
          'timelock',
        );
        timelock = timelockPrompt.timelock as Address;
      }

      if (!poolAddress) {
        const poolPrompt = await addressPrompt(
          'Enter pool contract address',
          'pool',
        );
        poolAddress = poolPrompt.pool as Address;
      }

      let maxSocializablePortionBP: number;
      if (maxSocializablePortionBPInput === undefined) {
        const bpPrompt = await textPrompt(
          'Enter max socializable portion in basis points (uint16, e.g., 100 = 1%)',
          'maxSocializablePortionBP',
        );
        maxSocializablePortionBP = Number(bpPrompt.maxSocializablePortionBP);
      } else {
        maxSocializablePortionBP = maxSocializablePortionBPInput;
      }

      if (maxSocializablePortionBP < 0 || maxSocializablePortionBP > 65535) {
        throw new Error(
          'maxSocializablePortionBP must be between 0 and 65535 (uint16)',
        );
      }

      const finalSalt = options?.salt
        ? stringToHex(options.salt)
        : ('0x0000000000000000000000000000000000000000000000000000000000000000' as Hex);

      const timelockContract = await getTimeLockContract(timelock);

      // Encode setMaxLossSocializationBP call (same as in propose)
      const data = encodeFunctionData({
        abi: StvStETHPoolAbi,
        functionName: 'setMaxLossSocializationBP',
        args: [maxSocializablePortionBP],
      });

      const predecessor =
        '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

      // Calculate operation ID (must match the one from schedule)
      const operationId = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'hashOperation',
        payload: [[poolAddress, 0n, data, predecessor, finalSalt]],
      });

      logInfo('Calculated operation details:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(`  Value: 0`);
      logInfo(`  Payload: ${data}`);
      logInfo(`  Predecessor: ${predecessor}`);
      logInfo(`  Salt: ${finalSalt}`);

      // Check operation state
      const state = await callReadMethodSilent({
        contract: timelockContract,
        methodName: 'getOperationState',
        payload: [[operationId]],
      });

      // OperationState: Unset=0, Waiting=1, Ready=2, Done=3
      if (state === 0) {
        logInfo('❌ Operation not found (Unset)');
        logInfo(`   Operation ID: ${operationId}`);
        logInfo(
          `   Make sure you used the same parameters (pool, maxSocializablePortionBP, salt) as in propose-set-max-loss-socialization-bp`,
        );
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
        const currentBlock = await publicClient.getBlock({
          blockTag: 'latest',
        });
        const now = currentBlock.timestamp;
        const waitTime = timestamp > now ? timestamp - now : 0n;
        logInfo(
          `⏳ Operation is waiting. Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
        );
        return;
      }

      logInfo('Executing operation:');
      logInfo(`  Operation ID: ${operationId}`);
      logInfo(`  Target: ${poolAddress}`);
      logInfo(
        `  Function: setMaxLossSocializationBP(${maxSocializablePortionBP})`,
      );

      const confirmationMessage = `Are you sure you want to execute setting maxLossSocializationBP to ${maxSocializablePortionBP} BP on pool ${poolAddress}?`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: timelockContract,
        methodName: 'execute',
        payload: [poolAddress, 0n, data, predecessor, finalSalt],
      });

      logInfo(`✅ Operation executed successfully!`);
      logInfo(`   Operation ID: ${operationId}`);
    },
  );
