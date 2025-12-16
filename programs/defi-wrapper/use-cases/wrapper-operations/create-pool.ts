import { Address, Hex } from 'viem';
import { getTransactionReceipt } from 'viem/actions';
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
  getFinalizePoolEventData,
  logFinalizePoolEventData,
} from 'features';
import { getPublicClient } from 'providers';

import { wrapperOperationsWrite } from './write.js';

type MintableOptions = {
  reserveRatioGapBP?: number;
};

type AllowlistableOptions = {
  allowListEnabled?: boolean;
};

const defiWrapperOperationsCreatePool = wrapperOperationsWrite
  .command('create-pool')
  .description('create pool commands');

defiWrapperOperationsCreatePool.addOption(new Option('-cmd2json'));
defiWrapperOperationsCreatePool.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(defiWrapperOperationsCreatePool));
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
    );
};

applyCommonOptions(
  defiWrapperOperationsCreatePool
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

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName: 'createPoolGGVStart',
        payload: [
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
          BigInt(reserveRatioGapBPValue),
        ],
      });

      if (!result.receipt || !result.tx) {
        logInfo('Transaction has been sent');
        return process.exit(0);
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      await finalizePoolCreation(contract, eventData);
    },
  );

applyCommonOptions(
  defiWrapperOperationsCreatePool
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

      const { vaultConfig, timelockConfig, commonPoolConfig } =
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
      });

      if (!result.receipt || !result.tx) {
        logInfo('Transaction has been sent');
        return process.exit(0);
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
  defiWrapperOperationsCreatePool
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
      const { vaultConfig, timelockConfig, commonPoolConfig } =
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
      });

      if (!result.receipt || !result.tx) {
        logInfo('Transaction has been sent');
        return process.exit(0);
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      await logCreatePoolEventData(eventData);

      await finalizePoolCreation(contract, eventData);
    },
  );

defiWrapperOperationsCreatePool
  .command('create-pool-finalize')
  .description(
    'finalizes the deployment of a pool. Used if the pool creation was not finalized in the first step (Multisig case).',
  )
  .argument('<address>', 'factory address', stringToAddress)
  .argument(
    '<TxHash>',
    'transaction hash of the first step of the pool creation',
    stringToHash,
  )
  .action(async (address: Address, txHash: Hex) => {
    const contract = await getFactoryContract(address);
    const publicClient = await getPublicClient();

    const receipt = await getTransactionReceipt(publicClient, {
      hash: txHash,
    });
    const eventData = await getCreatePoolEventData(receipt, txHash);

    await logCreatePoolEventData(eventData);

    await finalizePoolCreation(contract, eventData);
  });

defiWrapperOperationsCreatePool
  .command('log-creating-pool-data')
  .description(
    'logs the data of the created pool. Will be necessary for use in the UI configuration',
  )
  .argument(
    '<txHash>',
    'transaction hash of the first step of the pool creation',
    stringToHash,
  )
  .argument(
    '<finalizeTxHash>',
    'transaction hash of the final step of the pool creation',
    stringToHash,
  )
  .action(async (txHash: Hex, finalizeTxHash: Hex) => {
    const publicClient = await getPublicClient();

    const [firstStepReceipt, finalizeReceipt] = await Promise.all([
      getTransactionReceipt(publicClient, {
        hash: txHash,
      }),
      getTransactionReceipt(publicClient, {
        hash: finalizeTxHash,
      }),
    ]);

    const [firstStepEventData, finalizeEventData] = await Promise.all([
      getCreatePoolEventData(firstStepReceipt, txHash),
      getFinalizePoolEventData(finalizeReceipt, finalizeTxHash),
    ]);

    await logFinalizePoolEventData(firstStepEventData, finalizeEventData);
  });
