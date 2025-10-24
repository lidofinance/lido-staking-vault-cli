import { parseEventLogs, TransactionReceipt, Hex } from 'viem';

import { FactoryAbi } from 'abi/defi-wrapper/Factory.js';
import { program } from 'command';

export const getCreateVaultEventData = async (
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

  const vaultEvent = events.find(
    (event) => event.eventName === 'VaultWrapperCreated',
  );
  const vault = vaultEvent?.args.vault;
  const pool = vaultEvent?.args.pool;
  const withdrawalQueue = vaultEvent?.args.withdrawalQueue;
  const strategy = vaultEvent?.args.strategy;
  const configuration = vaultEvent?.args.configuration;

  return {
    vault,
    pool,
    withdrawalQueue,
    strategy,
    configuration,
    tx,
    blockNumber: receipt.blockNumber,
  };
};
