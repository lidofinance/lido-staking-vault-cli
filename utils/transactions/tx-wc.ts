/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  encodeFunctionData,
  type Hex,
  type SimulateCallsReturnType,
  type Abi,
  type WalletClient,
  type TransactionReceipt,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

import { getPublicClient, getWalletConnectClient } from 'providers';
import {
  showSpinner,
  printError,
  logResult,
  disconnectWalletConnect,
  logInfo,
  logError,
} from 'utils';

import { PartialContract, PopulatedTx, BatchTxArgs } from './types.js';
import { simulateCallsErrorHandler, isWcSendCallsFailure, getConfirmations } from './utils.js';

export const PROVIDER_POLLING_INTERVAL = 12_000;
export const AA_TX_POLLING_TIMEOUT = 180_000; // 3 minutes

export const isPopulatedTx = (tx: any): tx is PopulatedTx => {
  return !!tx && tx.to !== undefined && tx.data !== undefined;
};

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
    simulateCallsErrorHandler(simulateResult, abi);

    hideSpinner();

    return simulateResult;
  } catch (err) {
    hideSpinner();
    await disconnectWalletConnect();

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

const sendIndividualTransactions = async (
  walletConnectClient: WalletClient,
  calls: PopulatedTx[],
  isGnosis: boolean,
  withSpinner?: boolean,
): Promise<{
  id: Hex;
  callStatus?: never;
  txHash?: Hex;
  receipt?: Awaited<ReturnType<typeof waitForTransactionReceipt>>;
}> => {
  const { account } = walletConnectClient;
  const isBatch = calls.length > 1;

  if (!account) {
    throw new Error(
      'No wallet connect account found. Check your wallet and try again.',
    );
  }

  logInfo(
    `wallet_sendCalls not supported — sending ${calls.length} transaction(s) individually`,
  );

  const publicClient = await getPublicClient();
  const confirmations = getConfirmations();
  const txHashes: Hex[] = [];
  const receipts: TransactionReceipt[] = [];

  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    if (!call) throw new Error(`Call ${i + 1} is undefined`);
    if (!call.to) throw new Error(`Call ${i + 1} has no "to" address`);
    if (!call.data) throw new Error(`Call ${i + 1} has no "data"`);

    const hideSubmitSpinner = withSpinner
      ? showSpinner({
          type: 'bouncingBar',
          message: isBatch
            ? `Submitting transaction ${i + 1}/${calls.length}...`
            : 'Submitting transaction...',
        })
      : () => {};

    const txHash = await walletConnectClient.sendTransaction({
      account,
      to: call.to,
      data: call.data,
      value: call.value ?? 0n,
      chain: walletConnectClient.chain,
    });
    txHashes.push(txHash);

    hideSubmitSpinner();
    logInfo(`Transaction submitted: ${txHash}`);

    // Wait for each intermediate tx receipt
    if (!isGnosis) {
      const hideReceiptSpinner = withSpinner
        ? showSpinner({
            type: 'bouncingBar',
            message: isBatch
              ? `Waiting for transaction ${i + 1}/${calls.length} receipt...`
              : 'Waiting for transaction receipt...',
          })
        : () => {};
      const receipt = await waitForTransactionReceipt(publicClient, {
        hash: txHash,
        confirmations,
      });

      hideReceiptSpinner();
      receipts.push(receipt);

      logInfo(
        `Transaction ${i + 1}/${calls.length} confirmed: ${receipt.status}`,
      );
    }
  }

  if (txHashes.length === 0) throw new Error('No transactions were sent');
  if (isGnosis) return { id: txHashes.at(-1)! };

  return {
    id: txHashes.at(-1)!,
    txHash: txHashes.at(-1)!,
    receipt: receipts.at(-1)!,
  };
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
    const { walletConnectClient, isGnosis, supportsWalletSendCalls } =
      await getWalletConnectClient();

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

    // If wallet doesn't support wallet_sendCalls, skip directly to individual transactions
    if (!supportsWalletSendCalls) {
      const result = await sendIndividualTransactions(
        walletConnectClient,
        calls,
        isGnosis,
        withSpinner,
      );

      if (isGnosis) {
        logInfo('Transaction submitted to Gnosis Safe for signing.');
        logInfo(
          'Please sign and execute the transaction in the Gnosis Safe UI.',
        );
        logInfo(
          'Note: The CLI will not wait for execution completion as signing time is unlimited.',
        );
      }

      return result;
    }

    const hideSubmitSpinner = withSpinner
      ? showSpinner({
          type: 'bouncingBar',
          message: isBatch
            ? 'Submitting batch...'
            : 'Submitting transaction...',
        })
      : () => {};

    let sendCallsResult: Awaited<
      ReturnType<typeof walletConnectClient.sendCalls>
    >;
    try {
      sendCallsResult = await walletConnectClient.sendCalls({
        account: walletConnectClient.account.address,
        calls,
      });
    } catch (error) {
      hideSubmitSpinner();
      // If wallet_sendCalls fails despite being declared as supported, fall back to individual transactions
      const isSendCallsFailure = isWcSendCallsFailure(error);

      if (isSendCallsFailure) {
        logInfo(
          'wallet_sendCalls failed, falling back to individual eth_sendTransaction calls',
        );
        const result = await sendIndividualTransactions(
          walletConnectClient,
          calls,
          isGnosis,
          withSpinner,
        );

        if (isGnosis) {
          logInfo('Transaction submitted to Gnosis Safe for signing.');
          logInfo(
            'Please sign and execute the transaction in the Gnosis Safe UI.',
          );
          logInfo(
            'Note: The CLI will not wait for execution completion as signing time is unlimited.',
          );
        }

        return result;
      }
      throw error;
    }

    hideSubmitSpinner();

    if (isGnosis) {
      logInfo('Transaction submitted to Gnosis Safe for signing.');
      logInfo('Please sign and execute the transaction in the Gnosis Safe UI.');
      logInfo(
        'Note: The CLI will not wait for execution completion as signing time is unlimited.',
      );

      return { id: sendCallsResult.id as Hex };
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
      id: sendCallsResult.id,
      pollingInterval: PROVIDER_POLLING_INTERVAL,
      timeout: AA_TX_POLLING_TIMEOUT,
    });

    hideStatusSpinner();

    if (callStatus.status === 'failure') {
      logError(
        'Transaction failed. Check your wallet for details.',
        callStatus,
      );

      if (
        callStatus.receipts?.some((receipt) => receipt.status === 'reverted')
      ) {
        logError(
          'Some operation were reverted. Check your wallet for details.',
          callStatus.receipts?.filter(
            (receipt) => receipt.status === 'reverted',
          ),
        );
      }

      throw new Error('Transaction failed. Check your wallet for details.');
    }

    // safe check for reverted operations
    if (callStatus.receipts?.some((receipt) => receipt.status === 'reverted')) {
      throw new Error(
        'Some operation were reverted. Check your wallet for details.',
        {
          cause: callStatus.receipts?.filter(
            (receipt) => receipt.status === 'reverted',
          ),
        },
      );
    }

    // extract last receipt if there was no atomic batch
    const txHash = callStatus.receipts
      ? callStatus?.receipts.at(-1)?.transactionHash
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
      confirmations: getConfirmations(),
    });

    hideReceiptSpinner();

    return { id: sendCallsResult.id as Hex, callStatus, txHash, receipt };
  } catch (err) {
    await disconnectWalletConnect();

    if (!skipError) printError(err, 'Error when sending batch calls');

    throw err;
  }
};
