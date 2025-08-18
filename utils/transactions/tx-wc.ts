import { encodeFunctionData, Hex, SimulateCallsReturnType } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

import { getPublicClient, getWalletConnectClient } from 'providers';
import {
  showSpinner,
  printError,
  logResult,
  disconnectWalletConnect,
} from 'utils';

import { PartialContract, PopulatedTx, BatchTxArgs } from './types.js';

export const PROVIDER_POLLING_INTERVAL = 12_000;
export const AA_TX_POLLING_TIMEOUT = 180_000; // 3 minutes

export const simulateWCWriteTx = async (args: {
  calls: PopulatedTx[];
  withSpinner?: boolean;
  skipError?: boolean;
}): Promise<SimulateCallsReturnType<PopulatedTx[]>> => {
  const { calls, withSpinner = true, skipError = false } = args;
  const publicClient = getPublicClient();

  const hideSpinner = withSpinner
    ? showSpinner({
        type: 'bouncingBall',
        message: 'Simulating...',
      })
    : () => {};

  try {
    const walletConnectClient = await getWalletConnectClient();

    const simulateResult = await publicClient.simulateCalls({
      account: walletConnectClient.account,
      calls,
    });

    if (simulateResult.results.some((r) => r.error)) {
      throw new Error('Simulation failed');
    }
    hideSpinner();

    return simulateResult;
  } catch (err) {
    hideSpinner();

    if (!skipError) printError(err, 'Error when simulating write method');

    throw err;
  }
};

export const callWCWriteMethodWithReceipt = async (args: {
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

export const callWCWriteMethodWithReceiptPayloads = async <
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
  const isBatch = calls.length > 1;

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

    await simulateWCWriteTx({
      calls,
      withSpinner,
      skipError,
    });

    const hideSubmitSpinner = withSpinner
      ? showSpinner({
          type: 'bouncingBar',
          message: isBatch
            ? 'Submitting batch...'
            : 'Submitting transaction...',
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
          message: isBatch
            ? 'Waiting for batch status...'
            : 'Waiting for transaction status...',
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
