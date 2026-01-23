import { Address, Hex, zeroAddress } from 'viem';
import { Command, Option } from 'commander';

import {
  logInfo,
  logError,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToNumber,
  stringToBoolean,
  stringToHash,
} from 'utils';
import { getFactoryContract } from 'contracts/defi-wrapper/index.js';
import {
  getCreatePoolEventData,
  getReserveRatioGapBP,
  getBoolean,
  promtBaseVaultConfiguration,
  logCreatePoolEventData,
  type BaseFactoryOptions,
  finalizePoolCreation,
  prepareCreationConfigrationText,
  simulatePoolCreation,
} from 'features';

import { factory } from './main.js';

type MintableOptions = {
  reserveRatioGapBP?: number;
};

type AllowlistableOptions = {
  allowListEnabled?: boolean;
  allowListManager?: Address;
};

type CustomPoolOptions = {
  mintingEnabled?: boolean;
  strategyFactory?: Address;
  strategyFactoryDeployBytes?: Hex;
};

// CONSTANTS & HELPERS

const FIRST_STEP_MESSAGE =
  'Transaction has been sent. Use "dw use-cases wrapper-operations write create-pool-finalize" command to finalize the pool creation after the transaction is signed and executed';

// adds common options for all wrapper creation commands
const applyCommonOptions = (command: Command): Command => {
  return command
    .option('-no, --nodeOperator <nodeOperator>', 'node operator address')
    .option(
      '-nom, --nodeOperatorManager <nodeOperatorManager>',
      'node operator manager address',
    )
    .option(
      '-nof, --nodeOperatorFeeRate <nodeOperatorFeeRate>',
      'Node operator fee rate in basis points, for e.g. 100 == 1%',
      stringToNumber,
    )
    .option(
      '-ce, --confirmExpiry <confirmExpiry>',
      'confirm expiry in seconds',
      stringToNumber,
    )
    .option(
      '-md, --minDelaySeconds <minDelaySeconds>',
      'minimum delay in seconds',
      stringToNumber,
    )
    .option(
      '-mwd, --minWithdrawalDelayTime <minWithdrawalDelayTime>',
      'minimum withdrawal delay time in seconds',
      stringToNumber,
    )
    .option('-n, --name <name>', 'name of the pool shares')
    .option('-s, --symbol <symbol>', 'symbol of the pool shares')
    .option('-p, --proposer <proposer>', 'proposer address', stringToAddress)
    .option('-e, --executor <executor>', 'executor address', stringToAddress)
    .option(
      '-ec, --emergencyCommittee <emergencyCommittee>',
      'emergency committee address',
      stringToAddress,
    )
    .option(
      '--skip-simulation <skipSimulation>',
      'skip simulation step',
      stringToBoolean,
      false,
    )
    .option(
      '--simulation-only <simulationOnly>',
      'only perform simulation step',
      stringToBoolean,
      false,
    );
};

const ALLOW_LIST_ENABLED_OPTION = [
  '-al, --allowList <allowListEnabled>',
  'is allowlist enabled (true/false)',
  stringToBoolean,
] as const;

const ALLOW_LIST_MANAGER_OPTION = [
  '-alm, --allowListManager <allowListManager>',
  'allowlist manager address',
  stringToAddress,
] as const;

const RR_GAP_BP_OPTION = [
  '-rrg, --reserveRatioGapBP <reserveRatioGapBP>',
  'reserve ratio gap in basis points',
  stringToNumber,
] as const;

const MINTING_ENABLED_OPTION = [
  '-me, --mintingEnabled <mintingEnabled>',
  'is minting enabled (true/false)',
  stringToBoolean,
] as const;

const STRATEGY_FACTORY_OPTION = [
  '-sf, --strategyFactory <strategyFactory>',
  'address of the strategy factory to use',
  stringToAddress,
] as const;

const STRATEGY_FACTORY_DEPLOY_BYTES_OPTION = [
  '-sfd, --strategyFactoryDeployBytes <strategyFactoryDeployBytes>',
  'deployment bytecode for the strategy factory',
  stringToHash,
] as const;

// CORE FACTORY COMMAND

const factoryWrite = factory
  .command('write')
  .alias('w')
  .description('write commands');

factoryWrite.addOption(new Option('-cmd2json'));
factoryWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(factoryWrite));
  process.exit();
});

// CREATE POOL COMMANDS

applyCommonOptions(
  factoryWrite
    .command('create-pool-ggv')
    .description('initiates deployment of a GGV strategy pool')
    .argument('<address>', 'factory address', stringToAddress),
)
  .option(...RR_GAP_BP_OPTION)
  .action(
    async (
      address: Address,
      {
        reserveRatioGapBP,
        ...baseOptions
      }: BaseFactoryOptions & MintableOptions,
    ) => {
      const contract = await getFactoryContract(address);
      const { vaultConfig, timelockConfig, commonPoolConfig } =
        await promtBaseVaultConfiguration(baseOptions);

      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new GGV strategy pool with a configured wrapper?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const methodName = 'createPoolGGVStart' as const;
      const payload = [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        BigInt(reserveRatioGapBPValue),
      ] as const;

      if (!baseOptions.skipSimulation)
        await simulatePoolCreation(
          contract,
          methodName,
          payload,
          baseOptions.simulationOnly,
        );

      if (baseOptions.simulationOnly) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName,
        payload: [...payload],
      });

      if (!result.receipt || !result.tx) {
        logInfo(FIRST_STEP_MESSAGE);
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      await finalizePoolCreation(contract, eventData);
    },
  );

applyCommonOptions(
  factoryWrite
    .command('create-pool-stv')
    .description('initiates deployment of a STV staking pool')
    .argument('<address>', 'factory address', stringToAddress),
)
  .option(...ALLOW_LIST_ENABLED_OPTION)
  .option(...ALLOW_LIST_MANAGER_OPTION)
  .action(
    async (
      address: Address,
      {
        allowListEnabled,
        allowListManager,
        ...baseOptions
      }: BaseFactoryOptions & AllowlistableOptions,
    ) => {
      const contract = await getFactoryContract(address);

      const { vaultConfig, timelockConfig, commonPoolConfig } =
        await promtBaseVaultConfiguration(baseOptions);

      const allowListEnabledValue = await getBoolean(
        allowListEnabled,
        'AllowList',
      );

      const allowListManagerValue = allowListManager ?? zeroAddress;

      const confirmationMessage = `Are you sure you want to create a new STV pool with a configured wrapper?\n
         ${prepareCreationConfigrationText(
           vaultConfig,
           timelockConfig,
           commonPoolConfig,
         )} 
        allowListEnabled: ${allowListEnabledValue}
        allowListManager: ${allowListManagerValue === zeroAddress ? '<none>' : allowListManagerValue}\n`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const methodName = 'createPoolStvStart' as const;
      const payload = [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        allowListEnabledValue,
        allowListManagerValue,
      ] as const;

      if (!baseOptions.skipSimulation)
        await simulatePoolCreation(
          contract,
          methodName,
          payload,
          baseOptions.simulationOnly,
        );

      if (baseOptions.simulationOnly) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName,
        payload: [...payload],
      });

      if (!result.receipt || !result.tx) {
        logInfo(FIRST_STEP_MESSAGE);
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      if (
        !eventData.auxiliaryConfig ||
        !eventData.strategyFactory ||
        !eventData.strategyDeployBytes ||
        !eventData.intermediate
      ) {
        logError('Missing required data for pool creation finalize');
        return;
      }

      logInfo('Pool Creation Finalize');

      await finalizePoolCreation(contract, eventData);
    },
  );

applyCommonOptions(
  factoryWrite
    .command('create-pool-stv-steth')
    .description(
      'initiates deployment of a STV-STETH pool with minting enabled',
    )
    .argument('<address>', 'factory address', stringToAddress),
)
  .option(...RR_GAP_BP_OPTION)
  .option(...ALLOW_LIST_ENABLED_OPTION)
  .option(...ALLOW_LIST_MANAGER_OPTION)
  .action(
    async (
      address: Address,
      {
        reserveRatioGapBP,
        allowListEnabled,
        allowListManager,
        ...baseOptions
      }: BaseFactoryOptions & AllowlistableOptions & MintableOptions,
    ) => {
      const contract = await getFactoryContract(address);
      const { vaultConfig, timelockConfig, commonPoolConfig } =
        await promtBaseVaultConfiguration(baseOptions);

      const allowListEnabledValue = await getBoolean(
        allowListEnabled,
        'AllowList',
      );
      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const allowListManagerValue = allowListManager ?? zeroAddress;

      const confirmationMessage = `Are you sure you want to create a new STV-STETH pool with minting enabled?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        allowListEnabled: ${allowListEnabledValue}
        allowListManager: ${allowListManagerValue === zeroAddress ? '<none>' : allowListManagerValue}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const methodName = 'createPoolStvStETHStart' as const;
      const payload = [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        allowListEnabledValue,
        allowListManagerValue,
        BigInt(reserveRatioGapBPValue),
      ] as const;

      if (!baseOptions.skipSimulation)
        await simulatePoolCreation(
          contract,
          methodName,
          payload,
          baseOptions.simulationOnly,
        );

      if (baseOptions.simulationOnly) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName,
        payload: [...payload],
      });

      if (!result.receipt || !result.tx) {
        logInfo(FIRST_STEP_MESSAGE);
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      await finalizePoolCreation(contract, eventData);
    },
  );

applyCommonOptions(
  factoryWrite
    .command('create-pool-custom')
    .description('initiates deployment of a custom pool')
    .argument('<address>', 'factory address', stringToAddress),
)
  .option(...RR_GAP_BP_OPTION)
  .option(...ALLOW_LIST_ENABLED_OPTION)
  .option(...ALLOW_LIST_MANAGER_OPTION)
  .option(...MINTING_ENABLED_OPTION)
  .option(...STRATEGY_FACTORY_OPTION)
  .option(...STRATEGY_FACTORY_DEPLOY_BYTES_OPTION)
  .action(
    async (
      address: Address,
      {
        reserveRatioGapBP,
        allowListManager,
        allowListEnabled,
        mintingEnabled,
        strategyFactory,
        strategyFactoryDeployBytes,
        ...baseOptions
      }: CustomPoolOptions &
        BaseFactoryOptions &
        AllowlistableOptions &
        MintableOptions,
    ) => {
      const contract = await getFactoryContract(address);
      const { vaultConfig, timelockConfig, commonPoolConfig } =
        await promtBaseVaultConfiguration(baseOptions);

      const allowListEnabledValue = await getBoolean(
        allowListEnabled,
        'AllowList',
      );

      const allowListManagerValue = allowListManager ?? zeroAddress;

      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new custom pool?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        strategyFactory: ${strategyFactory ? strategyFactory : '<none>'}
        strategyFactoryDeployBytes: ${
          strategyFactoryDeployBytes ? strategyFactoryDeployBytes : '<none>'
        }
        mintingEnabled: ${mintingEnabled !== undefined ? mintingEnabled : true}
        allowListEnabled: ${allowListEnabledValue}
        allowListManager: ${allowListManagerValue === zeroAddress ? '<none>' : allowListManagerValue}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const methodName = 'createPoolStart' as const;
      const payload = [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        {
          allowListEnabled: allowListEnabledValue,
          allowListManager: allowListManagerValue,
          reserveRatioGapBP: BigInt(reserveRatioGapBPValue),
          mintingEnabled: true,
        },
        strategyFactory ?? zeroAddress,
        strategyFactoryDeployBytes ?? '0x',
      ] as const;

      if (!baseOptions.skipSimulation)
        await simulatePoolCreation(
          contract,
          methodName,
          payload,
          baseOptions.simulationOnly,
        );

      if (baseOptions.simulationOnly) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName,
        payload: [...payload],
      });

      if (!result.receipt || !result.tx) {
        logInfo(FIRST_STEP_MESSAGE);
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      await finalizePoolCreation(contract, eventData);
    },
  );
