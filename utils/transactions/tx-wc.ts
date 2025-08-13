import { Address, TransactionReceipt, SimulateContractReturnType } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

import { getPublicClient, getWalletConnectClient } from 'providers';
import { getChain } from 'configs';
import {
  showSpinner,
  printError,
  logResult,
  disconnectWalletConnect,
} from 'utils';

import { PartialContract, Writeable, GetFirst } from './types.js';

export const simulateWalletConnectWriteTx = async <
  T extends PartialContract,
  M extends keyof T['simulate'] & string,
>(args: {
  contract: T;
  methodName: M;
  payload: Writeable<GetFirst<Parameters<T['simulate'][M]>>> | never[];
  value?: bigint;
  withSpinner?: boolean;
  skipError?: boolean;
}): Promise<SimulateContractReturnType> => {
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
>(args: {
  contract: T;
  methodName: M;
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[];
  value?: bigint;
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
}): Promise<Address> => {
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
>(args: {
  contract: T;
  methodName: M;
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[];
  value?: bigint;
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
}): Promise<{ receipt: TransactionReceipt; tx: Address }> => {
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
