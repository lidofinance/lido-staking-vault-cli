import { parseEventLogs } from 'viem';
import { VaultWithDelegation } from 'types';
import { getVaultFactoryContract } from 'contracts';
import { VaultFactoryAbi } from 'abi/index.js';
import { callWriteMethodWithReceipt } from 'utils';

export const createVault = async (payload: VaultWithDelegation) => {
  const contract = getVaultFactoryContract();

  const result = await callWriteMethodWithReceipt(
    contract,
    'createVaultWithDelegation',
    [payload, '0x'],
  );
  if (!result) return;
  const { receipt, tx } = result;

  const events = parseEventLogs({
    abi: VaultFactoryAbi,
    logs: receipt.logs,
  });

  const vaultEvent = events.find((event) => event.eventName === 'VaultCreated');
  const vault = vaultEvent?.args.vault;
  const delegation = vaultEvent?.args.owner;

  return {
    vault,
    delegation,
    tx,
    blockNumber: receipt.blockNumber,
  };
};
