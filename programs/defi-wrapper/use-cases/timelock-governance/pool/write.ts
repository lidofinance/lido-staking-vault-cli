import { Option } from 'commander';
import { Address, encodeFunctionData, maxUint16, Hex } from 'viem';

import {
  ACCOUNT_GRANT_ARGUMENT,
  ACCOUNT_REVOKE_ARGUMENT,
  executeOperation,
  getPromptTimelock,
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
  textPrompt,
  processSalt,
  promptAccount,
  promptRole,
} from 'utils';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/index.js';
import { StvPoolAbi, StvStETHPoolAbi } from 'abi/defi-wrapper/index.js';

import { pool } from './main.js';

// Common helpers

const POOL_ARGUMENT = [
  '[pool]',
  'pool contract address',
  stringToAddress,
] as const;

const MAX_SOCIALIZABLE_PORTION_BP_ARGUMENT = [
  '[maxSocializablePortionBP]',
  'max socializable portion in basis points (uint16)',
  (v: string) => (v ? Number(v) : undefined),
] as const;

const promptPool = async (poolAddress?: Address) => {
  if (!poolAddress) {
    const poolPrompt = await addressPrompt(
      'Enter pool contract address',
      'pool',
    );
    poolAddress = poolPrompt.pool as Address;
  }
  return getStvStethPoolContract(poolAddress);
};

const promptMaxSocializablePortionBP = async (
  maxSocializablePortionBPInput?: number,
): Promise<number> => {
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

  if (maxSocializablePortionBP < 0 || maxSocializablePortionBP > maxUint16) {
    throw new Error(
      `maxSocializablePortionBP must be between 0 and ${maxUint16} (uint16)`,
    );
  }
  return maxSocializablePortionBP;
};

// Command definitions

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
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...POOL_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_GRANT_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const poolContract = await promptPool(poolAddress);

      const role = await promptRole(roleInput, poolContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to grant role to',
      );

      // Encode grantRole call
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await proposeOperation(
        timelockContract.address,
        poolContract.address,
        data,
        finalSalt,
        'grantRole',
        `Are you sure you want to propose granting role ${role} to ${account} on pool ${poolContract.address}?`,
      );
    },
  );

poolWrite
  .command('execute-grant-role')
  .description('execute granting a role on Pool via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...POOL_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_GRANT_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const poolContract = await promptPool(poolAddress);

      const role = await promptRole(roleInput, poolContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to grant role to',
      );

      // Encode grantRole call (same as in propose)
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'grantRole',
        args: [role, account],
      });

      await executeOperation(
        timelockContract.address,
        poolContract.address,
        data,
        finalSalt,
        'grantRole',
        `Are you sure you want to execute granting role ${role} to ${account} on pool ${poolContract.address}?`,
      );
    },
  );

poolWrite
  .command('propose-revoke-role')
  .description('propose revoking a role on Pool via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...POOL_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_REVOKE_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const poolContract = await promptPool(poolAddress);

      const role = await promptRole(roleInput, poolContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to revoke role from',
      );

      // Encode revokeRole call
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await proposeOperation(
        timelockContract.address,
        poolContract.address,
        data,
        finalSalt,
        'revokeRole',
        `Are you sure you want to propose revoking role ${role} from ${account} on pool ${poolContract.address}?`,
      );
    },
  );

poolWrite
  .command('execute-revoke-role')
  .description('execute revoking a role on Pool via Timelock')
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...POOL_ARGUMENT)
  .argument(...ROLE_ARGUMENT)
  .argument(...ACCOUNT_REVOKE_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      roleInput?: string,
      accountInput?: string,
      options?: { salt?: Hex },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const poolContract = await promptPool(poolAddress);

      const role = await promptRole(roleInput, poolContract);

      const finalSalt = processSalt(options?.salt);

      const account = await promptAccount(
        accountInput,
        'Enter account address to revoke role from',
      );

      // Encode revokeRole call
      const data = encodeFunctionData({
        abi: StvPoolAbi,
        functionName: 'revokeRole',
        args: [role, account],
      });

      await executeOperation(
        timelockContract.address,
        poolContract.address,
        data,
        finalSalt,
        'revokeRole',
        `Are you sure you want to execute revoking role ${role} from ${account} on pool ${poolContract.address}?`,
      );
    },
  );

poolWrite
  .command('propose-set-max-loss-socialization-bp')
  .description(
    'propose setting maxLossSocializationBP on StvStETHPool via Timelock',
  )
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...POOL_ARGUMENT)
  .argument(...MAX_SOCIALIZABLE_PORTION_BP_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      maxSocializablePortionBPInput?: number,
      options?: { salt?: Hex },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const poolContract = await promptPool(poolAddress);

      const maxSocializablePortionBP = await promptMaxSocializablePortionBP(
        maxSocializablePortionBPInput,
      );

      const finalSalt = processSalt(options?.salt);

      // Encode setMaxLossSocializationBP call
      const data = encodeFunctionData({
        abi: StvStETHPoolAbi,
        functionName: 'setMaxLossSocializationBP',
        args: [maxSocializablePortionBP],
      });

      await proposeOperation(
        timelockContract.address,
        poolContract.address,
        data,
        finalSalt,
        `setMaxLossSocializationBP(${maxSocializablePortionBP})`,
        `Are you sure you want to propose setting maxLossSocializationBP to ${maxSocializablePortionBP} BP on pool ${poolContract.address}?`,
      );
    },
  );

poolWrite
  .command('execute-set-max-loss-socialization-bp')
  .description(
    'execute setting maxLossSocializationBP on StvStETHPool via Timelock',
  )
  .argument(...TIMELOCK_ARGUMENT)
  .argument(...POOL_ARGUMENT)
  .argument(...MAX_SOCIALIZABLE_PORTION_BP_ARGUMENT)
  .option(...SALT_OPTION)
  .action(
    async (
      timelock?: Address,
      poolAddress?: Address,
      maxSocializablePortionBPInput?: number,
      options?: { salt?: Hex },
    ) => {
      // Interactive prompts for missing parameters
      const timelockContract = await getPromptTimelock(timelock);

      const poolContract = await promptPool(poolAddress);

      const maxSocializablePortionBP = await promptMaxSocializablePortionBP(
        maxSocializablePortionBPInput,
      );

      const finalSalt = processSalt(options?.salt);

      // Encode setMaxLossSocializationBP call (same as in propose)
      const data = encodeFunctionData({
        abi: StvStETHPoolAbi,
        functionName: 'setMaxLossSocializationBP',
        args: [maxSocializablePortionBP],
      });

      await executeOperation(
        timelockContract.address,
        poolContract.address,
        data,
        finalSalt,
        `setMaxLossSocializationBP(${maxSocializablePortionBP})`,
        `Are you sure you want to execute setting maxLossSocializationBP to ${maxSocializablePortionBP} BP on pool ${poolContract.address}?`,
      );
    },
  );
