import { Address } from 'viem';
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
} from 'utils';
import { getFactoryContract } from 'contracts/defi-wrapper/index.js';
import {
  getCreatePoolEventData,
  getFinalizePoolEventData,
  getReserveRatioGapBP,
  getBoolean,
  BaseFactoryOptions,
  promtBaseVaultConfiguration,
  logCreatePoolEventData,
  logFinalizePoolEventData,
  CommonPoolConfig,
  VaultConfig,
  TimelockConfig,
} from 'features';

import { factory } from './main.js';

type MintableOptions = {
  reserveRatioGapBP?: number;
};

type AllowlistableOptions = {
  allowListEnabled?: boolean;
};

const factoryWrite = factory
  .command('write')
  .alias('w')
  .description('write commands');

factoryWrite.addOption(new Option('-cmd2json'));
factoryWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(factoryWrite));
  process.exit();
});

// adds common options for all wrapper creation commands
const applyCommonOptions = (command: Command): Command => {
  return command
    .option('-no, --nodeOperator <nodeOperator>', 'node operator address')
    .option(
      '-nom, --nodeOperatorManager <nodeOperatorManager>',
      'node operator manager address',
    )
    .option(
      '-nof , --nodeOperatorFeeRate <nodeOperatorFeeRate>',
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
    );
};

// сommon filaliztion step between two pools
const finalizePoolCreation = async (
  contract: Awaited<ReturnType<typeof getFactoryContract>>,
  vaultConfig: VaultConfig,
  timelockConfig: TimelockConfig,
  commonPoolConfig: CommonPoolConfig,
  creationEventData: Awaited<ReturnType<typeof getCreatePoolEventData>>,
) => {
  if (
    !creationEventData.auxiliaryConfig ||
    !creationEventData.strategyFactory ||
    !creationEventData.strategyDeployBytes ||
    !creationEventData.intermediate
  ) {
    logError('Missing required data for pool creation finalize');
    return;
  }

  logInfo('Pool Creation Finalize');

  const finalizeResult = await callWriteMethodWithReceipt({
    contract,
    methodName: 'createPoolFinish',
    payload: [
      vaultConfig,
      timelockConfig,
      commonPoolConfig,
      creationEventData.auxiliaryConfig,
      creationEventData.strategyFactory,
      creationEventData.strategyDeployBytes,
      creationEventData.intermediate,
    ],
  });

  if (!finalizeResult.receipt || !finalizeResult.tx) {
    logInfo('Transaction has been sent');
    return;
  }

  const finalizeEventData = await getFinalizePoolEventData(
    finalizeResult.receipt,
    finalizeResult.tx,
  );

  await logFinalizePoolEventData(creationEventData, finalizeEventData);
};

// common text for vault configuration conformatin
const prepareCreationConfigrationText = (
  vaultConfig: VaultConfig,
  timelockConfig: TimelockConfig,
  commonPoolConfig: CommonPoolConfig,
) => {
  return `nodeOperator: ${vaultConfig.nodeOperator}
        nodeOperatorManager: ${vaultConfig.nodeOperatorManager}
        nodeOperatorFeeBP: ${vaultConfig.nodeOperatorFeeBP}
        confirmExpiry: ${vaultConfig.confirmExpiry}
        minDelaySeconds: ${timelockConfig.minDelaySeconds}
        proposer: ${timelockConfig.proposer}
        executor: ${timelockConfig.executor}
        emergencyCommittee: ${commonPoolConfig.emergencyCommittee}
        minWithdrawalDelayTime: ${commonPoolConfig.minWithdrawalDelayTime}
        name: ${commonPoolConfig.name}
        symbol: ${commonPoolConfig.symbol}`;
};

applyCommonOptions(
  factoryWrite
    .command('create-pool-ggv')
    .description('initiates deployment of a GGV strategy pool')
    .argument('<address>', 'factory address', stringToAddress),
)
  .option(
    '-rrg, --reserveRatioGapBP <reserveRatioGapBP>',
    'reserve ratio gap in basis points',
    stringToNumber,
  )
  .action(
    async (
      address: Address,
      {
        reserveRatioGapBP,
        ...baseOptions
      }: BaseFactoryOptions & MintableOptions,
    ) => {
      const contract = await getFactoryContract(address);
      const { vaultConfig, timelockConfig, commonPoolConfig, CONNECT_DEPOSIT } =
        await promtBaseVaultConfiguration(baseOptions);

      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new pool GGV strategy with a configured wrapper?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createPoolGGVStart',
        payload: [
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
          BigInt(reserveRatioGapBPValue),
        ],
        value: CONNECT_DEPOSIT,
      });

      if (!result.receipt || !result.tx) {
        logInfo('Transaction has been sent');
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      await finalizePoolCreation(
        contract,
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        eventData,
      );
    },
  );

applyCommonOptions(
  factoryWrite
    .command('create-pool-stv')
    .description('initiates deployment of a STV staking pool')
    .argument('<address>', 'factory address', stringToAddress),
)
  .option(
    '-al, --allowList <allowListEnabled>',
    'is allowlist enabled (true/false)',
    stringToBoolean,
  )
  .action(
    async (
      address: Address,
      {
        allowListEnabled,
        ...baseOptions
      }: BaseFactoryOptions & AllowlistableOptions,
    ) => {
      const contract = await getFactoryContract(address);

      const { vaultConfig, timelockConfig, commonPoolConfig, CONNECT_DEPOSIT } =
        await promtBaseVaultConfiguration(baseOptions);

      const allowListEnabledValue = await getBoolean(
        allowListEnabled,
        'AllowList',
      );

      const confirmationMessage = `Are you sure you want to create a new STV pool with a configured wrapper?\n
         ${prepareCreationConfigrationText(
           vaultConfig,
           timelockConfig,
           commonPoolConfig,
         )}
        allowListEnabled: ${allowListEnabledValue}\n`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createPoolStvStart',
        payload: [
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
          allowListEnabledValue,
        ],
        value: CONNECT_DEPOSIT,
      });

      if (!result.receipt || !result.tx) {
        logInfo('Transaction has been sent');
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

      await finalizePoolCreation(
        contract,
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        eventData,
      );
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
  .option(
    '-rrg, --reserveRatioGapBP <reserveRatioGapBP>',
    'reserve ratio gap in basis points',
    stringToNumber,
  )
  .option(
    '-al, --allowList <allowListEnabled>',
    'is allowlist enabled (true/false)',
    stringToBoolean,
  )
  .action(
    async (
      address: Address,
      {
        reserveRatioGapBP,
        allowListEnabled,
        ...baseOptions
      }: BaseFactoryOptions & AllowlistableOptions & MintableOptions,
    ) => {
      const contract = await getFactoryContract(address);
      const { vaultConfig, timelockConfig, commonPoolConfig, CONNECT_DEPOSIT } =
        await promtBaseVaultConfiguration(baseOptions);

      const allowListEnabledValue = await getBoolean(
        allowListEnabled,
        'AllowList',
      );
      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new STV-STETH pool with minting enabled?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        allowListEnabled: ${allowListEnabledValue}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createPoolStvStETHStart',
        payload: [
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
          allowListEnabledValue,
          BigInt(reserveRatioGapBPValue),
        ],
        value: CONNECT_DEPOSIT,
      });

      if (!result.receipt || !result.tx) {
        logInfo('Transaction has been sent');
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      await finalizePoolCreation(
        contract,
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        eventData,
      );
    },
  );
