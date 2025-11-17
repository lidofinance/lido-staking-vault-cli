import { parseEventLogs, TransactionReceipt, Hex } from 'viem';

import { FactoryAbi } from 'abi/defi-wrapper/Factory.js';
import { program } from 'command';

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
