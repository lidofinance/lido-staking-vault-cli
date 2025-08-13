import {
  Address,
  TransactionReceipt,
  SimulateContractReturnType,
  encodeFunctionData,
  Hex,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

import { getPublicClient, getWalletConnectClient } from 'providers';
import { getChain } from 'configs';
import {
  showSpinner,
  printError,
  logResult,
  disconnectWalletConnect,
} from 'utils';

import {
  PartialContract,
  PopulatedTx,
  BatchTxArgs,
  WriteTxArgs,
} from './types.js';

export const PROVIDER_POLLING_INTERVAL = 12_000;
export const AA_TX_POLLING_TIMEOUT = 180_000; // 3 minutes

export const simulateWalletConnectWriteTx = async <
  T extends PartialContract,
  M extends keyof T['simulate'] & string,
>(
  args: WriteTxArgs<T, M>,
): Promise<SimulateContractReturnType> => {
  const {
    contract,
    methodName,
    payload,
    value,
    withSpinner = true,
    skipError = false,
  } = args;
  const hideSpinner = withSpinner
    ? showSpinner({
        type: 'bouncingBall',
        message: 'Simulating...',
      })
    : () => {};

  try {
    const method = contract.simulate[methodName];
    const walletConnectClient = await getWalletConnectClient();
    const result = await method?.(payload, {
      account: walletConnectClient.account,
      chain: getChain(),
      value,
    });
    hideSpinner();

    return result;
  } catch (err) {
    hideSpinner();

    if (!skipError)
      printError(err, `Error when simulating write method "${methodName}"`);

    throw err;
  }
};

export const callWalletConnectWriteMethod = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(
  args: WriteTxArgs<T, M>,
): Promise<Address> => {
  const {
    contract,
    methodName,
    payload,
    value,
    withSpinner = true,
    silent = false,
    skipError = false,
  } = args;

  const simulateResult = await simulateWalletConnectWriteTx({
    contract,
    methodName,
    payload,
    value,
    withSpinner,
    skipError,
  });
  if (!simulateResult) {
    printError(
      new Error('Simulation failed'),
      `Error when simulating write method "${methodName}"`,
    );

    throw new Error('Simulation failed');
  }

  const hideSpinner = withSpinner
    ? showSpinner({
        type: 'bouncingBar',
        message: 'Waiting for transaction receipt...',
      })
    : () => {};
  try {
    const walletConnectClient = await getWalletConnectClient();

    if (!walletConnectClient || !walletConnectClient.account) {
      throw new Error(
        'No wallet connect client found. Check your wallet and try again.',
      );
    }

    const tx = await walletConnectClient.writeContract({
      address: contract.address,
      abi: contract.abi,
      functionName: methodName,
      args: payload as any,
      value,
      account: walletConnectClient.account,
      chain: getChain(),
    });
    hideSpinner();

    !silent &&
      logResult({
        data: [
          ['Method name', methodName],
          ['Contract', contract.address],
          ['Transaction', tx],
        ],
      });

    return tx;
  } catch (err) {
    hideSpinner();
    await disconnectWalletConnect();

    if (!skipError)
      printError(err, `Error when calling write method "${methodName}"`);

    throw err;
  }
};

export const callWalletConnectWriteMethodWithReceipt = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(
  args: WriteTxArgs<T, M>,
): Promise<{ receipt: TransactionReceipt; tx: Address }> => {
  const {
    contract,
    methodName,
    payload,
    value,
    withSpinner = true,
    silent = false,
    skipError = false,
  } = args;
  const publicClient = getPublicClient();

  const tx = await callWalletConnectWriteMethod({
    contract,
    methodName,
    payload,
    value,
    withSpinner,
    silent,
    skipError,
  });

  const hideSpinner = withSpinner
    ? showSpinner({
        type: 'bouncingBar',
        message: 'Waiting for transaction receipt...',
      })
    : () => {};

  try {
    const receipt = await waitForTransactionReceipt(publicClient, {
      hash: tx,
      confirmations: 3,
    });
    hideSpinner();

    !silent &&
      logResult({
        data: [
          ['Method name', methodName],
          ['Contract', contract.address],
          ['Transaction status', receipt.status],
          ['Transaction block number', Number(receipt.blockNumber)],
          ['Transaction gas used', Number(receipt.gasUsed)],
        ],
      });

    return { receipt, tx };
  } catch (err) {
    hideSpinner();
    await disconnectWalletConnect();

    if (!skipError)
      printError(err, 'Error when waiting for transaction receipt');

    throw err;
  }
};

export const callWalletConnectWriteBatchCalls = async (args: {
  calls: PopulatedTx[];
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
}) => {
  const { calls, withSpinner = true, silent = false, skipError = false } = args;

  const walletConnectClient = await getWalletConnectClient();

  if (!walletConnectClient || !walletConnectClient.account) {
    throw new Error(
      'No wallet connect client found. Check your wallet and try again.',
    );
  }

  const result = await callWalletConnectSendCalls({
    calls,
    withSpinner,
    silent,
    skipError,
  });

  !silent &&
    logResult({
      data: [
        ['Batch calls', calls.length],
        ['Batch ID', result.id],
        ['Batch status', result.callStatus.status],
        ['Transaction', result.txHash],
        ['Transaction status', result.receipt.status],
        ['Transaction block number', Number(result.receipt.blockNumber)],
        ['Transaction gas used', Number(result.receipt.gasUsed)],
      ],
    });

  return result;
};

export const callWalletConnectWriteBatchPayloads = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(
  args: BatchTxArgs<T, M>,
) => {
  const {
    contract,
    methodName,
    payloads,
    values,
    withSpinner = true,
    silent = false,
    skipError = false,
  } = args;

  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error('payloads must be a non-empty array');
  }

  const calls = payloads.map((p, i) => ({
    to: contract.address,
    data: encodeFunctionData({
      abi: contract.abi,
      functionName: methodName as any,
      args: p as any,
    }),
    value: values?.[i] ?? 0n,
  }));

  const result = await callWalletConnectSendCalls({
    calls,
    withSpinner,
    silent,
    skipError,
  });

  !silent &&
    logResult({
      data: [
        ['Method name', methodName],
        ['Contract', contract.address],
        ['Batch calls', payloads.length],
        ['Batch ID', result.id],
        ['Batch status', result.callStatus.status],
        ['Transaction', result.txHash],
        ['Transaction status', result.receipt.status],
        ['Transaction block number', Number(result.receipt.blockNumber)],
        ['Transaction gas used', Number(result.receipt.gasUsed)],
      ],
    });
};

const callWalletConnectSendCalls = async (args: {
  calls: PopulatedTx[];
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
}) => {
  const { calls, withSpinner = true, skipError = false } = args;

  if (!Array.isArray(calls) || calls.length === 0) {
    throw new Error('calls must be a non-empty array');
  }

  try {
    const walletConnectClient = await getWalletConnectClient();

    if (!walletConnectClient || !walletConnectClient.account) {
      throw new Error(
        'No wallet connect client found. Check your wallet and try again.',
      );
    }

    const hideSubmitSpinner = withSpinner
      ? showSpinner({
          type: 'bouncingBar',
          message: 'Submitting batch...',
        })
      : () => {};

    const result = await walletConnectClient.sendCalls({
      account: walletConnectClient.account.address,
      calls,
      experimental_fallback: true, // fallback to legacy sendTransaction if sendCalls is not supported
    });

    hideSubmitSpinner();

    const hideStatusSpinner = withSpinner
      ? showSpinner({
          type: 'bouncingBar',
          message: 'Waiting for batch status...',
        })
      : () => {};

    const callStatus = await walletConnectClient.waitForCallsStatus({
      id: result.id,
      pollingInterval: PROVIDER_POLLING_INTERVAL,
      timeout: AA_TX_POLLING_TIMEOUT,
    });

    hideStatusSpinner();

    if (callStatus.status === 'failure') {
      throw new Error('Transaction failed. Check your wallet for details.');
    }

    if (callStatus.receipts?.find((receipt) => receipt.status === 'reverted')) {
      throw new Error(
        'Some operation were reverted. Check your wallet for details.',
      );
    }

    // extract last receipt if there was no atomic batch
    const txHash = callStatus.receipts
      ? callStatus?.receipts[callStatus.receipts.length - 1]?.transactionHash
      : undefined;

    if (!txHash) {
      throw new Error(
        'Could not locate TX hash.Check your wallet for details.',
      );
    }

    const hideReceiptSpinner = withSpinner
      ? showSpinner({
          type: 'bouncingBar',
          message: 'Waiting for transaction receipt...',
        })
      : () => {};

    const publicClient = getPublicClient();
    const receipt = await waitForTransactionReceipt(publicClient, {
      hash: txHash,
      confirmations: 3,
    });

    hideReceiptSpinner();

    return { id: result.id as Hex, callStatus, txHash, receipt };
  } catch (err) {
    await disconnectWalletConnect();

    if (!skipError) printError(err, 'Error when sending batch calls');

    throw err;
  }
};
