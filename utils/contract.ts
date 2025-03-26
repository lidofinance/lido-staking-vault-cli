import { printError } from 'utils';
import { getAccount, getPublicClient } from 'providers';
import { getChain } from 'configs';
import { Address, SimulateContractReturnType, TransactionReceipt } from 'viem';

import { showSpinner } from 'utils/index.js';
import { waitForTransactionReceipt } from 'viem/actions';

export type ReadContract = {
  read: Record<string, (...args: any[]) => Promise<any>>;
};

export type PartialContract = ReadContract & {
  simulate: Record<string, (...args: any[]) => Promise<any>>;
  write: Record<string, (...args: any[]) => Promise<any>>;
};

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type GetFirst<T extends unknown[]> = T extends [infer First, infer _Second]
  ? First
  : T extends any
    ? []
    : T;

export const callSimulateWriteMethod = async <
  T extends PartialContract,
  M extends keyof T['simulate'] & string,
>(
  contract: T,
  methodName: M,
  payload: Writeable<GetFirst<Parameters<T['simulate'][M]>>> | never[],
  value?: bigint,
): Promise<SimulateContractReturnType | null> => {
  const hideSpinner = showSpinner({
    type: 'bouncingBall',
    message: 'Simulating...',
  });

  try {
    const method = contract.simulate[methodName];
    const result = await method?.(payload, {
      account: getAccount(),
      chain: getChain(),
      value,
    });
    hideSpinner();

    return result;
  } catch (err) {
    hideSpinner();
    printError(err, `Error when simulating write method "${methodName}"`);

    return null;
  }
};

export const callWriteMethod = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(
  contract: T,
  methodName: M,
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[],
  value?: bigint,
): Promise<Address | undefined> => {
  const simulateResult = await callSimulateWriteMethod(
    contract,
    methodName,
    payload,
    value,
  );
  if (!simulateResult) {
    printError(
      new Error('Simulation failed'),
      `Error when simulating write method "${methodName}"`,
    );

    return;
  }

  const hideSpinner = showSpinner();
  try {
    const method = contract.write[methodName];
    const tx = await method?.(payload, {
      account: getAccount(),
      chain: getChain(),
      value,
    });
    hideSpinner();

    console.table({ Transaction: tx });

    return tx;
  } catch (err) {
    hideSpinner();
    printError(err, `Error when calling write method "${methodName}"`);

    return;
  }
};

export const callReadMethod = async <
  T extends ReadContract,
  M extends keyof T['read'] & string,
>(
  contract: T,
  methodName: M,
  ...payload: Parameters<T['read'][M]>
): Promise<ReturnType<T['read'][M]> | undefined> => {
  const hideSpinner = showSpinner();

  try {
    const method = contract.read[methodName];
    const result = await method?.(payload[0]);
    hideSpinner();
    // TODO: do message better or show in called place
    console.table({ Result: result });

    return result;
  } catch (err) {
    hideSpinner();
    printError(err, `Error when calling read method "${methodName}"`);

    return;
  }
};

export const isContractAddress = async (address: Address) => {
  const publicClient = getPublicClient();
  const bytecode = await publicClient.getCode({
    address: address,
  });

  return bytecode !== undefined;
};

export const callWriteMethodWithReceipt = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(
  contract: T,
  methodName: M,
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[],
  value?: bigint,
): Promise<{ receipt: TransactionReceipt; tx: Address } | undefined> => {
  const publicClient = getPublicClient();

  const tx = await callWriteMethod(contract, methodName, payload, value);
  if (!tx) return;

  const hideSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Waiting for transaction receipt...',
  });

  try {
    const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
    hideSpinner();

    console.table({
      'Transaction status': receipt.status,
      'Transaction block number': Number(receipt.blockNumber),
      'Transaction gas used': Number(receipt.gasUsed),
    });

    return { receipt, tx };
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when waiting for transaction receipt');

    return;
  }
};
