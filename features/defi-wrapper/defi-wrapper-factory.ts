import {
  parseEventLogs,
  TransactionReceipt,
  Hex,
  Address,
  fromHex,
  isAddressEqual,
  zeroAddress,
} from 'viem';

import { getFactoryContract } from 'contracts/defi-wrapper/index.js';
import { FactoryAbi } from 'abi/defi-wrapper/Factory.js';
import { program } from 'command';
import { getVaultHubContract } from 'contracts';
import {
  getAddress,
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
  nodeOperatorFeeRate?: number;
  confirmExpiry?: number;
  minDelaySeconds?: number;
  emergencyCommittee?: Address;
  proposer?: Address;
  executor?: Address;
  minWithdrawalDelayTime?: number;
  name?: string;
  symbol?: string;
};

// сommon filaliztion step between two pools
export const finalizePoolCreation = async (
  contract: Awaited<ReturnType<typeof getFactoryContract>>,
  creationEventData: Awaited<ReturnType<typeof getCreatePoolEventData>>,
) => {
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
    logInfo('Transaction has been sent');
    return;
  }

  const finalizeEventData = await getFinalizePoolEventData(
    finalizeResult.receipt,
    finalizeResult.tx,
  );

  await logFinalizePoolEventData(creationEventData, finalizeEventData);
};

export const getCreatePoolEventData = async (
  receipt: TransactionReceipt,
  tx: Hex,
) => {
  if (program.opts().populateTx) {
    return { tx };
  }

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

export const logCreatePoolEventData = async (
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
      ['Allowlist Enabled', eventData.auxiliaryConfig?.allowlistEnabled],
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
  if (program.opts().populateTx) {
    return { tx };
  }

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

export const logFinalizePoolEventData = async (
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

export const promtBaseVaultConfiguration = async ({
  nodeOperator,
  nodeOperatorManager,
  nodeOperatorFeeRate,
  confirmExpiry,
  minDelaySeconds,
  proposer,
  executor,
  emergencyCommittee,
  minWithdrawalDelayTime,
  name,
  symbol,
}: BaseFactoryOptions) => {
  const nodeOperatorAddress = await getAddress(nodeOperator, 'Node Operator');
  const nodeOperatorManagerAddress = await getAddress(
    nodeOperatorManager,
    'Node Operator Manager',
  );

  const nodeOperatorFeeRateValue =
    await getNodeOperatorFeeRate(nodeOperatorFeeRate);
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
