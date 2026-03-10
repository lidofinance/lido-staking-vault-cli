import {
  parseEventLogs,
  TransactionReceipt,
  Hex,
  Address,
  fromHex,
  isAddressEqual,
  zeroAddress,
  encodeFunctionData,
} from 'viem';

import { FactoryContract } from 'contracts/defi-wrapper/index.js';
import { FactoryAbi } from 'abi/defi-wrapper/Factory.js';
import { getVaultHubContract } from 'contracts';
import {
  getAddress,
  getBoolean,
  getConfirmExpiry,
  getMinDelaySeconds,
  getMinWithdrawalDelayTime,
  getNodeOperatorFeeRate,
  getPoolTokenName,
  getPoolTokenSymbol,
} from 'features';
import {
  logInfo,
  logResult,
  logError,
  callWriteMethodWithReceipt,
} from 'utils';
import { getAccount, getPublicClient } from 'providers/wallet.js';

export type VaultConfig = {
  nodeOperator: Address; // Address of the node operator managing the vault
  nodeOperatorManager: Address; // Address authorized to manage node operator settings
  nodeOperatorFeeBP: bigint; // Node operator fee in basis points (1 BP = 0.01%)
  confirmExpiry: bigint; // Time period for confirmation expiry
};

export type TimelockConfig = {
  minDelaySeconds: bigint; // Minimum delay before executing queued operations
  proposer: Address; // Address authorized to propose operations
  executor: Address; // Address authorized to execute operations
};

export type CommonPoolConfig = {
  minWithdrawalDelayTime: bigint; // Minimum delay time for processing withdrawals
  name: string; // ERC20 token name for the pool shares
  symbol: string; // ERC20 token symbol for the pool shares
  emergencyCommittee: Address; // Address of the emergency committee for pausing operations
};

export type BaseFactoryOptions = {
  nodeOperator?: Address;
  nodeOperatorManager?: Address;
  nodeOperatorFeeRateBP?: number;
  confirmExpiry?: number;
  minDelaySeconds?: number;
  emergencyCommittee?: Address;
  proposer?: Address;
  executor?: Address;
  minWithdrawalDelayTime?: number;
  name?: string;
  symbol?: string;
  skipSimulation?: boolean;
  simulationOnly?: boolean;
  skipFinalization?: boolean;
};

export type AllowListFactoryOptions = {
  allowList?: boolean;
  allowListManager?: Address;
  promptAllowListManager?: boolean;
};

export const MELLOW_VAULTS_STRATEGY_ID = 'strategy.mellow.v1';

// сommon filaliztion step between two pools
export const finalizePoolCreation = async (
  contract: FactoryContract,
  creationEventData: Awaited<ReturnType<typeof getCreatePoolEventData>>,
): Promise<void> => {
  if (
    !creationEventData.auxiliaryConfig ||
    !creationEventData.strategyFactory ||
    !creationEventData.strategyDeployBytes ||
    !creationEventData.intermediate ||
    !creationEventData.vaultConfig ||
    !creationEventData.timelockConfig ||
    !creationEventData.commonPoolConfig
  ) {
    logError('Missing required data for pool creation finalize');
    return;
  }

  const vaultHubContract = await getVaultHubContract();
  const CONNECT_DEPOSIT = await vaultHubContract.read.CONNECT_DEPOSIT();

  logInfo('Pool Creation Finalize');

  const finalizeResult = await callWriteMethodWithReceipt({
    contract,
    methodName: 'createPoolFinish',
    payload: [
      creationEventData.vaultConfig,
      creationEventData.timelockConfig,
      creationEventData.commonPoolConfig,
      creationEventData.auxiliaryConfig,
      creationEventData.strategyFactory,
      creationEventData.strategyDeployBytes,
      creationEventData.intermediate,
    ],
    value: CONNECT_DEPOSIT,
  });

  if (!finalizeResult.receipt || !finalizeResult.tx) {
    logInfo(
      'Transaction has been sent. Use "dw c f r log-creating-pool-data" command to get the Pool data after the transaction is signed and executed',
    );
    return;
  }

  const finalizeEventData = await getFinalizePoolEventData(
    finalizeResult.receipt,
    finalizeResult.tx,
  );

  logFinalizePoolEventData(creationEventData, finalizeEventData);
};

export const getCreatePoolEventData = async (
  receipt: TransactionReceipt,
  tx: Hex,
) => {
  const events = parseEventLogs({
    abi: FactoryAbi,
    logs: receipt.logs,
    strict: true,
  });

  const poolEvent = events.find(
    (event) => event.eventName === 'PoolCreationStarted',
  );

  const sender = poolEvent?.args.sender;
  const vaultConfig = poolEvent?.args.vaultConfig;
  const commonPoolConfig = poolEvent?.args.commonPoolConfig;
  const auxiliaryConfig = poolEvent?.args.auxiliaryConfig;
  const timelockConfig = poolEvent?.args.timelockConfig;
  const strategyFactory = poolEvent?.args.strategyFactory;
  const strategyDeployBytes = poolEvent?.args.strategyDeployBytes;
  const intermediate = poolEvent?.args.intermediate;
  const finishDeadline = poolEvent?.args.finishDeadline;

  return {
    sender,
    vaultConfig,
    commonPoolConfig,
    auxiliaryConfig,
    timelockConfig,
    strategyFactory,
    strategyDeployBytes,
    intermediate,
    finishDeadline,
    tx,
    blockNumber: receipt.blockNumber,
  };
};

export const logCreatePoolEventData = (
  eventData: Awaited<ReturnType<typeof getCreatePoolEventData>>,
) => {
  logInfo('Pool Creation Started');
  logResult({
    data: [
      ['Sender', eventData.sender],
      ['Strategy Factory', eventData.strategyFactory],
      ['Strategy Deploy Bytes', eventData.strategyDeployBytes],
      ['Finish Deadline', eventData.finishDeadline],
      ['Transaction Hash', eventData.tx],
      ['Block Number', eventData.blockNumber],
    ],
  });

  logInfo('Vault Config');
  logResult({
    data: [
      ['Node Operator', eventData.vaultConfig?.nodeOperator],
      ['Node Operator Manager', eventData.vaultConfig?.nodeOperatorManager],
      ['Node Operator Fee BP', eventData.vaultConfig?.nodeOperatorFeeBP],
      ['Confirm Expiry', eventData.vaultConfig?.confirmExpiry],
    ],
  });

  logInfo('Common Pool Config');
  logResult({
    data: [
      [
        'Min Withdrawal Delay Time',
        eventData.commonPoolConfig?.minWithdrawalDelayTime,
      ],
      ['Name', eventData.commonPoolConfig?.name],
      ['Symbol', eventData.commonPoolConfig?.symbol],
    ],
  });

  logInfo('Auxiliary Config');
  logResult({
    data: [
      ['Allowlist Enabled', eventData.auxiliaryConfig?.allowListEnabled],
      ['Minting Enabled', eventData.auxiliaryConfig?.mintingEnabled],
      ['Reserve Ratio Gap BP', eventData.auxiliaryConfig?.reserveRatioGapBP],
    ],
  });

  logInfo('Timelock Config');
  logResult({
    data: [
      ['Min Delay Seconds', eventData.timelockConfig?.minDelaySeconds],
      ['Proposer', eventData.timelockConfig?.proposer],
      ['Executor', eventData.timelockConfig?.executor],
    ],
  });

  logInfo('Intermediate');
  logResult({
    data: [
      ['Dashboard', eventData.intermediate?.dashboard],
      ['Pool Proxy', eventData.intermediate?.poolProxy],
      ['Withdrawal Queue Proxy', eventData.intermediate?.withdrawalQueueProxy],
      ['Timelock', eventData.intermediate?.timelock],
    ],
  });
};

export const getFinalizePoolEventData = async (
  receipt: TransactionReceipt,
  tx: Hex,
) => {
  const events = parseEventLogs({
    abi: FactoryAbi,
    logs: receipt.logs,
  });

  const poolEvent = events.find((event) => event.eventName === 'PoolCreated');
  const vault = poolEvent?.args.vault;
  const pool = poolEvent?.args.pool;
  const poolType = poolEvent?.args.poolType;
  const withdrawalQueue = poolEvent?.args.withdrawalQueue;
  const strategyFactory = poolEvent?.args.strategyFactory;
  const strategyDeployBytes = poolEvent?.args.strategyDeployBytes;
  const strategy = poolEvent?.args.strategy;

  return {
    vault,
    pool,
    poolType,
    withdrawalQueue,
    strategyFactory,
    strategyDeployBytes,
    strategy,
    tx,
    blockNumber: receipt.blockNumber,
  };
};

export const logFinalizePoolEventData = (
  createEventData: Awaited<ReturnType<typeof getCreatePoolEventData>>,
  finalizeEventData: Awaited<ReturnType<typeof getFinalizePoolEventData>>,
) => {
  const poolType =
    finalizeEventData.poolType &&
    fromHex(finalizeEventData.poolType, 'string').replace(/\W/g, '');

  logInfo('Pool Creation Finalized');
  logResult({
    data: [
      ['Vault', finalizeEventData.vault],
      ['Pool', finalizeEventData.pool],
      ['Pool Type', poolType],
      ['Withdrawal Queue', finalizeEventData.withdrawalQueue],
      ['Timelock', createEventData.intermediate?.timelock],
      ['Strategy Factory', finalizeEventData.strategyFactory],
      ['Strategy Deploy Bytes', finalizeEventData.strategyDeployBytes],
      ['Strategy', finalizeEventData.strategy],
      ['Transaction Hash', finalizeEventData.tx],
      ['Block Number', finalizeEventData.blockNumber],
    ],
  });

  // log UI strategy ENV only if it's not the zero address - meaning it's stvStrategyPool
  const strategyDataEntry =
    finalizeEventData.strategy &&
    !isAddressEqual(finalizeEventData.strategy, zeroAddress)
      ? [['VITE_STRATEGY_ADDRESS', finalizeEventData.strategy]]
      : [];

  logInfo('UI Environment Variables:');
  logResult({
    data: [
      ['VITE_POOL_TYPE', poolType],
      ['VITE_POOL_ADDRESS', finalizeEventData.pool],
      ...strategyDataEntry,
    ],
  });
};

export const promptBaseVaultConfiguration = async ({
  nodeOperator,
  nodeOperatorManager,
  nodeOperatorFeeRateBP,
  confirmExpiry,
  minDelaySeconds,
  proposer,
  executor,
  emergencyCommittee,
  minWithdrawalDelayTime,
  name,
  symbol,
  simulationOnly,
  skipSimulation,
}: BaseFactoryOptions) => {
  // validate incompatible options
  if (skipSimulation && simulationOnly) {
    throw new Error(
      'Cannot use both --skip-simulation and --simulation-only options together',
    );
  }

  const nodeOperatorAddress = await getAddress(nodeOperator, 'Node Operator');
  const nodeOperatorManagerAddress = await getAddress(
    nodeOperatorManager,
    'Node Operator Manager',
  );

  const nodeOperatorFeeRateValue = await getNodeOperatorFeeRate(
    nodeOperatorFeeRateBP,
  );
  const confirmExpiryValue = await getConfirmExpiry({
    confirmExpiry,
  });

  const minDelaySecondsValue = await getMinDelaySeconds(minDelaySeconds);
  const proposerAddress = await getAddress(proposer, 'Proposer');
  const executorAddress = await getAddress(executor, 'Executor');
  const emergencyCommitteeAddress = await getAddress(
    emergencyCommittee,
    'Emergency Committee',
  );

  const minWithdrawalDelayTimeValue = await getMinWithdrawalDelayTime(
    minWithdrawalDelayTime,
  );

  const nameValue = await getPoolTokenName(name);
  const symbolValue = await getPoolTokenSymbol(symbol);

  const vaultConfig: VaultConfig = {
    nodeOperator: nodeOperatorAddress,
    nodeOperatorManager: nodeOperatorManagerAddress,
    nodeOperatorFeeBP: BigInt(nodeOperatorFeeRateValue),
    confirmExpiry: BigInt(confirmExpiryValue),
  };
  const timelockConfig: TimelockConfig = {
    minDelaySeconds: BigInt(minDelaySecondsValue),
    proposer: proposerAddress,
    executor: executorAddress,
  };
  const commonPoolConfig: CommonPoolConfig = {
    minWithdrawalDelayTime: BigInt(minWithdrawalDelayTimeValue),
    name: nameValue,
    symbol: symbolValue,
    emergencyCommittee: emergencyCommitteeAddress,
  };

  return {
    vaultConfig,
    timelockConfig,
    commonPoolConfig,
  };
};

export const promptAllowListConfiguration = async ({
  allowList,
  allowListManager,
  promptAllowListManager = true,
}: AllowListFactoryOptions) => {
  const allowListEnabledValue = await getBoolean(allowList, 'AllowList');
  let allowListManagerAddress = zeroAddress;
  if (allowListEnabledValue && promptAllowListManager) {
    allowListManagerAddress = await getAddress(
      allowListManager,
      'AllowList Manager',
    );
  } else if (allowListManager) {
    throw new Error(
      'Cannot specify an AllowList Manager when AllowList is disabled',
    );
  }

  return {
    allowListEnabled: allowListEnabledValue,
    allowListManager: allowListManagerAddress,
  };
};

const logAndThrowEthSimulateV1Error = (error: unknown) => {
  logError(
    'Could not simulate pool creation. Use `--skip-simulation true` to skip it.',
  );
  logInfo(
    'Some RPC providers do not support eth_simulateV1. Consider switching to another RPC provider.',
  );
  throw error;
};

export const simulatePoolCreation = async (
  contract: FactoryContract,
  creationMethodName:
    | 'createPoolStart'
    | 'createPoolStvStETHStart'
    | 'createPoolStvStart',
  creationPayload: readonly unknown[],
  logSimulation = false,
) => {
  const publicClient = await getPublicClient();
  const account = await getAccount();
  const CONNECT_DEPOSIT = await (
    await getVaultHubContract()
  ).read.CONNECT_DEPOSIT();

  const creationCalls = await publicClient
    .simulateCalls({
      account: account.address,
      calls: [
        {
          to: contract.address,
          data: encodeFunctionData({
            abi: FactoryAbi,
            functionName: creationMethodName,
            args: creationPayload as any,
          }),
        },
      ],
    })
    .catch(logAndThrowEthSimulateV1Error);

  const creationTx = creationCalls.results[0];

  // check for step 1 simulation success
  if (creationTx.status !== 'success') {
    logError('Pool creation simulation failed');
    throw creationTx.error;
  }

  const creationEventData = await getCreatePoolEventData(
    {
      logs: creationTx.logs,
      blockNumber: 0n,
      transactionHash: zeroAddress,
    } as unknown as TransactionReceipt,
    zeroAddress,
  );

  if (
    !creationEventData.strategyFactory ||
    !creationEventData.vaultConfig ||
    !creationEventData.timelockConfig ||
    !creationEventData.commonPoolConfig ||
    !creationEventData.auxiliaryConfig ||
    !creationEventData.strategyDeployBytes ||
    !creationEventData.intermediate
  ) {
    throw new Error('Failed to parse strategy factory from simulation');
  }
  const fullCalls = await publicClient
    .simulateCalls({
      account: account.address,
      calls: [
        {
          to: contract.address,
          data: encodeFunctionData({
            abi: FactoryAbi,
            functionName: creationMethodName,
            args: creationPayload as any,
          }),
        },
        {
          to: contract.address,
          value: CONNECT_DEPOSIT,
          data: encodeFunctionData({
            abi: FactoryAbi,
            functionName: 'createPoolFinish',
            args: [
              creationEventData.vaultConfig,
              creationEventData.timelockConfig,
              creationEventData.commonPoolConfig,
              creationEventData.auxiliaryConfig,
              creationEventData.strategyFactory,
              creationEventData.strategyDeployBytes,
              creationEventData.intermediate,
            ],
          }),
        },
      ],
    })
    .catch(logAndThrowEthSimulateV1Error);

  if (fullCalls.results[1].status !== 'success') {
    logError('Pool finalization simulation failed');
    throw fullCalls.results[1].error;
  }

  logInfo('Pool creation simulation succeeded');

  if (logSimulation) {
    const finalizeEventData = await getFinalizePoolEventData(
      {
        logs: fullCalls.results[1].logs,
        blockNumber: 0n,
        transactionHash: zeroAddress,
      } as unknown as TransactionReceipt,
      zeroAddress,
    );
    logInfo('Results of the simulated pool creation:');
    logFinalizePoolEventData(creationEventData, finalizeEventData);
    logInfo(
      '⚠️⚠️⚠️ This is a simulation only. No real contracts were created. Real contract addresses might not match the simulation ⚠️⚠️⚠️',
    );
  }
};
