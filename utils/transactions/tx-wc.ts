import {
  decodeErrorResult,
  encodeFunctionData,
  Hex,
  SimulateCallsReturnType,
  Abi,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

import { DashboardAbi } from 'abi/Dashboard.js';

import { getPublicClient, getWalletConnectClient } from 'providers';
import {
  showSpinner,
  printError,
  logResult,
  disconnectWalletConnect,
  logInfo,
} from 'utils';

import { PartialContract, PopulatedTx, BatchTxArgs } from './types.js';

export const PROVIDER_POLLING_INTERVAL = 12_000;
export const AA_TX_POLLING_TIMEOUT = 180_000; // 3 minutes

export const simulateWCWriteTx = async (args: {
  calls: PopulatedTx[];
  withSpinner?: boolean;
  skipError?: boolean;
  abi?: Abi;
}): Promise<SimulateCallsReturnType<PopulatedTx[]>> => {
  const { calls, withSpinner = true, skipError = false, abi } = args;
  const publicClient = await getPublicClient();

  const hideSpinner = withSpinner
    ? showSpinner({
        type: 'bouncingBall',
        message: 'Simulating...',
      })
    : () => {};

  try {
    const { walletConnectClient } = await getWalletConnectClient();

    const simulateResult = await publicClient.simulateCalls({
      account: walletConnectClient.account,
      calls,
    });

    if (simulateResult.results.some((r) => r.error)) {
      const error = simulateResult.results.find((r) => r.error)?.error;
      const cause = error?.cause as any;

      const data = cause?.data ?? cause?.raw;
      if (data) {
        const { errorName, args } = decodeErrorResult({
          abi: abi ?? DashboardAbi,
          data,
        });

        const errorArgs = args?.map((a) => a?.toString() ?? '') ?? [];
        const errorMessage = `${errorName}: ${errorArgs.join(', ')}`;
        printError(new Error(errorMessage), 'Simulation failed');
      }

      const shortMessage = cause?.shortMessage;
      printError(error, shortMessage);
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
  abi?: Abi;
}) => {
  const {
    calls,
    withSpinner = true,
    silent = false,
    skipError = false,
    abi,
  } = args;

  const { walletConnectClient } = await getWalletConnectClient();

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
    abi,
  });

  const data = [
    ['Batch calls', calls.length],
    ['Batch ID', result.id],
    result.callStatus ? ['Batch status', result.callStatus.status] : undefined,
    result.txHash ? ['Transaction', result.txHash] : undefined,
    result.receipt ? ['Transaction status', result.receipt.status] : undefined,
    result.receipt
      ? ['Transaction block number', Number(result.receipt.blockNumber)]
      : undefined,
    result.receipt
      ? ['Transaction gas used', Number(result.receipt.gasUsed)]
      : undefined,
  ].filter((d) => d !== undefined);

  !silent &&
    logResult({
      data,
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
    abi: contract.abi,
  });

  const data = [
    ['Method name', methodName],
    ['Contract', contract.address],
    ['Batch calls', payloads.length],
    ['Batch ID', result.id],
    result.callStatus ? ['Batch status', result.callStatus.status] : undefined,
    result.txHash ? ['Transaction', result.txHash] : undefined,
    result.receipt ? ['Transaction status', result.receipt.status] : undefined,
    result.receipt
      ? ['Transaction block number', Number(result.receipt.blockNumber)]
      : undefined,
    result.receipt
      ? ['Transaction gas used', Number(result.receipt.gasUsed)]
      : undefined,
  ].filter((d) => d !== undefined);

  !silent &&
    logResult({
      data,
    });

  return result;
};

const callWalletConnectSendCalls = async (args: {
  calls: PopulatedTx[];
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
  abi?: Abi;
}) => {
  const { calls, withSpinner = true, skipError = false, abi } = args;
  const isBatch = calls.length > 1;

  if (!Array.isArray(calls) || calls.length === 0) {
    throw new Error('calls must be a non-empty array');
  }

  try {
    const { walletConnectClient, isGnosis } = await getWalletConnectClient();

    if (!walletConnectClient || !walletConnectClient.account) {
      throw new Error(
        'No wallet connect client found. Check your wallet and try again.',
      );
    }

    await simulateWCWriteTx({
      calls,
      withSpinner,
      skipError,
      abi,
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

    if (isGnosis) {
      logInfo('Transaction submitted to Gnosis Safe for signing.');
      logInfo('Please sign and execute the transaction in the Gnosis Safe UI.');
      logInfo(
        'Note: The CLI will not wait for execution completion as signing time is unlimited.',
      );

      return { id: result.id as Hex };
    }

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
      // eslint-disable-next-line no-console
      console.log(callStatus);
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

    const publicClient = await getPublicClient();
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
