import {
  Address,
  encodeAbiParameters,
  Hex,
  keccak256,
  toBytes,
  zeroAddress,
} from 'viem';
import { getTransactionReceipt } from 'viem/actions';
import { Command, Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  callWriteMethodWithReceipt,
  confirmOperation,
  stringToNumber,
  stringToBoolean,
  stringToHash,
  withError,
} from 'utils';
import {
  getFactoryContract,
  getStrategyFactoryContract,
} from 'contracts/defi-wrapper/index.js';
import {
  getCreatePoolEventData,
  getReserveRatioGapBP,
  promptBaseVaultConfiguration,
  logCreatePoolEventData,
  type BaseFactoryOptions,
  finalizePoolCreation,
  prepareCreationConfigrationText,
  simulatePoolCreation,
  promptAllowListConfiguration,
  MELLOW_VAULTS_STRATEGY_ID,
} from 'features';

import { factory } from './main.js';
import { getPublicClient } from 'providers';
import { verifyContract } from 'features/defi-wrapper/verify-contracts.js';
import { envs } from 'configs/index.js';

type MintableOptions = {
  reserveRatioGapBP?: number;
};

type AllowlistableOptions = {
  allowList?: boolean;
  allowListManager?: Address;
};

type CustomPoolOptions = {
  mintingEnabled?: boolean;
  strategyFactory?: Address;
  strategyFactoryDeployBytes?: Hex;
};

// CONSTANTS & HELPERS

const FIRST_STEP_MESSAGE =
  'Transaction has been sent. Use "dw contracts factory write create-pool-finalize" command to finalize the pool creation after the transaction is signed and executed';

// adds common options for all wrapper creation commands
const applyCommonOptions = (command: Command): Command => {
  return command
    .option('-no, --nodeOperator <nodeOperator>', 'node operator address')
    .option(
      '-nom, --nodeOperatorManager <nodeOperatorManager>',
      'node operator manager address',
    )
    .option(
      '-nof, --nodeOperatorFeeRateBP <nodeOperatorFeeRateBP>',
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
    )
    .option(
      '--skip-finalization <skipFinalization>',
      'skip finalization step',
      stringToBoolean,
      false,
    );
};

const ALLOW_LIST_ENABLED_OPTION = [
  '-al, --allowList <allowList>',
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
        allowList,
        allowListManager,
        ...baseOptions
      }: BaseFactoryOptions & AllowlistableOptions,
    ) => {
      const contract = await getFactoryContract(address);

      const { vaultConfig, timelockConfig, commonPoolConfig } =
        await promptBaseVaultConfiguration(baseOptions);

      const allowListConfig = await promptAllowListConfiguration({
        allowList,
        allowListManager,
      });

      const confirmationMessage = `Are you sure you want to create a new STV pool with a configured wrapper?\n
         ${prepareCreationConfigrationText(
           vaultConfig,
           timelockConfig,
           commonPoolConfig,
         )} 
        allowListEnabled: ${allowListConfig.allowListEnabled}
        allowListManager: ${allowListConfig.allowListManager === zeroAddress ? '<none>' : allowListConfig.allowListManager}\n`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const methodName = 'createPoolStvStart' as const;

      if (!baseOptions.skipSimulation)
        await simulatePoolCreation(
          contract,
          methodName,
          [
            vaultConfig,
            timelockConfig,
            commonPoolConfig,
            allowListConfig.allowListEnabled,
            allowListConfig.allowListManager,
          ],
          baseOptions.simulationOnly,
        );

      if (baseOptions.simulationOnly) return;

      const result = await callWriteMethodWithReceipt({
        contract,
        methodName,
        payload: [
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
          allowListConfig.allowListEnabled,
          allowListConfig.allowListManager,
        ],
      });

      if (!result.receipt || !result.tx) {
        logInfo(FIRST_STEP_MESSAGE);
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      logCreatePoolEventData(eventData);

      if (baseOptions.skipFinalization) {
        logInfo('Skipping pool creation finalization as per user request');
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
        allowList,
        allowListManager,
        ...baseOptions
      }: BaseFactoryOptions & AllowlistableOptions & MintableOptions,
    ) => {
      const contract = await getFactoryContract(address);
      const { vaultConfig, timelockConfig, commonPoolConfig } =
        await promptBaseVaultConfiguration(baseOptions);

      const allowListConfig = await promptAllowListConfiguration({
        allowList,
        allowListManager,
      });

      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new STV-STETH pool with minting enabled?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        allowListEnabled: ${allowListConfig.allowListEnabled}
        allowListManager: ${allowListConfig.allowListManager === zeroAddress ? '<none>' : allowListConfig.allowListManager}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const methodName = 'createPoolStvStETHStart' as const;
      const payload = [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        allowListConfig.allowListEnabled,
        allowListConfig.allowListManager,
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

      logCreatePoolEventData(eventData);

      if (baseOptions.skipFinalization) {
        logInfo('Skipping pool creation finalization as per user request');
        return;
      }

      logInfo('Pool Creation Finalize');

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
        allowList,
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
        await promptBaseVaultConfiguration(baseOptions);

      const allowListConfig = await promptAllowListConfiguration({
        allowList,
        allowListManager,
      });

      if (strategyFactory) {
        if (!allowListConfig.allowListEnabled)
          throw new Error(
            'StvStrategyPool creation requires allowlist to be enabled. AllowList can be configured on strategy contract(if supported).',
          );
        if (allowListConfig.allowListManager !== zeroAddress) {
          throw new Error(
            'StvStrategyPool creation with custom strategy factory does not support setting AllowList Manager. This role will be able to manage list of allowed strategies and should only be set via Timelock Governance after the pool creation.',
          );
        }
      }

      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new custom pool?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        strategyFactory: ${strategyFactory ?? '<none>'}
        strategyFactoryDeployBytes: ${strategyFactoryDeployBytes ?? '<none>'}
        mintingEnabled: ${mintingEnabled !== undefined ? mintingEnabled : true}
        allowListEnabled: ${allowListConfig.allowListEnabled}
        allowListManager: ${allowListConfig.allowListManager === zeroAddress ? '<none>' : allowListConfig.allowListManager}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const methodName = 'createPoolStart' as const;
      const payload = [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        {
          allowListEnabled: allowListConfig.allowListEnabled,
          allowListManager: allowListConfig.allowListManager,
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

      logCreatePoolEventData(eventData);

      if (baseOptions.skipFinalization) {
        logInfo('Skipping pool creation finalization as per user request');
        return;
      }

      logInfo('Pool Creation Finalize');

      await finalizePoolCreation(contract, eventData);
    },
  );

applyCommonOptions(
  factoryWrite
    .command('create-strategy-pool-lido-earn-eth')
    .description(
      'initiates deployment of a strategy pool with Lido Earn ETH strategy',
    )
    .argument('<address>', 'factory address', stringToAddress)
    .argument(
      '<strategyFactoryAddress>',
      'strategy factory address',
      stringToAddress,
    ),
)
  .option(...RR_GAP_BP_OPTION)
  .option(...ALLOW_LIST_ENABLED_OPTION)
  .action(
    async (
      factoryAddress: Address,
      strategyFactoryAddress: Address,
      {
        allowListManager,
        allowList,
        reserveRatioGapBP,
        ...baseOptions
      }: BaseFactoryOptions & AllowlistableOptions & MintableOptions,
    ) => {
      const wrapperFactoryContract = await getFactoryContract(factoryAddress);
      const strategyFactoryContract = await getStrategyFactoryContract(
        strategyFactoryAddress,
      );

      const { result: STRATEGY_ID, error } = await withError(
        strategyFactoryContract.read.STRATEGY_ID(),
      );

      if (error || !STRATEGY_ID) {
        throw new Error(
          `Error reading STRATEGY_ID from the strategy factory contract: ${error}. Make sure the provided address is correct and the contract is properly deployed.`,
        );
      }

      if (STRATEGY_ID !== keccak256(toBytes(MELLOW_VAULTS_STRATEGY_ID))) {
        throw new Error(
          `The provided strategy factory contract has an incompatible STRATEGY_ID. Check that the contract at address ${strategyFactoryAddress} is the correct one.`,
        );
      }

      const { vaultConfig, timelockConfig, commonPoolConfig } =
        await promptBaseVaultConfiguration(baseOptions);

      const allowListConfig = await promptAllowListConfiguration({
        allowList,
        allowListManager,
        promptAllowListManager: false,
      });

      const reserveRatioGapBPValue =
        await getReserveRatioGapBP(reserveRatioGapBP);

      const confirmationMessage = `Are you sure you want to create a new custom pool?\n
        ${prepareCreationConfigrationText(
          vaultConfig,
          timelockConfig,
          commonPoolConfig,
        )}
        strategy.id: ${MELLOW_VAULTS_STRATEGY_ID}
        strategy.allowListEnabled: ${allowListConfig.allowListEnabled}
        reserveRatioGapBP: ${reserveRatioGapBPValue}\n`;

      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const strategyFactoryDeployBytes = encodeAbiParameters(
        [{ type: 'bool', name: 'allowListEnabled' }],
        [allowListConfig.allowListEnabled],
      );

      const methodName = 'createPoolStart' as const;
      const payload = [
        vaultConfig,
        timelockConfig,
        commonPoolConfig,
        {
          reserveRatioGapBP: BigInt(reserveRatioGapBPValue),
          // correct configuration for stvStrategyPool
          allowListEnabled: true,
          allowListManager: zeroAddress,
          mintingEnabled: true,
        },
        strategyFactoryAddress,
        strategyFactoryDeployBytes,
      ] as const;

      if (!baseOptions.skipSimulation)
        await simulatePoolCreation(
          wrapperFactoryContract,
          methodName,
          payload,
          baseOptions.simulationOnly,
        );

      if (baseOptions.simulationOnly) return;

      const result = await callWriteMethodWithReceipt({
        contract: wrapperFactoryContract,
        methodName,
        payload: [...payload],
      });

      if (!result.receipt || !result.tx) {
        logInfo(FIRST_STEP_MESSAGE);
        return;
      }

      const eventData = await getCreatePoolEventData(result.receipt, result.tx);

      logCreatePoolEventData(eventData);

      if (baseOptions.skipFinalization) {
        logInfo('Skipping pool creation finalization as per user request');
        return;
      }

      logInfo('Pool Creation Finalize');

      await finalizePoolCreation(wrapperFactoryContract, eventData);
    },
  );

factoryWrite
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

    logCreatePoolEventData(eventData);

    await finalizePoolCreation(contract, eventData);
  });

factoryWrite
  .command('verify-contract')
  .description('verifies deployed contract on Etherscan')
  .argument('<contractName>', 'contract name')
  .argument('<contractAddress>', 's address', stringToAddress)
  .option(
    '--etherscanApiKey [etherscanApiKey]',
    'Etherscan API Key',
    envs?.ETHERSCAN_API_KEY,
  )
  .action(
    async (
      contractName: string,
      contractAddress: Address,
      options: { etherscanApiKey?: string },
    ) => {
      const { etherscanApiKey } = options;
      if (!etherscanApiKey) {
        throw new Error(
          'Etherscan API key is required for contract verification. Please provide it in .env or via --etherscanApiKey option.',
        );
      }
      await verifyContract(
        contractName as any,
        contractAddress,
        etherscanApiKey,
      );
    },
  );
