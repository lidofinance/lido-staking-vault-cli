import {
  Address,
  SimulateContractReturnType,
  TransactionReceipt,
  encodeFunctionData,
  Hex,
  Abi,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { program } from 'command';

import { getAccount, getPublicClient } from 'providers';
import { getChain } from 'configs';

import { showSpinner, printError, logResult, logInfo } from 'utils';

export type ReadContract = {
  address: Address;
  read: Record<string, (...args: any[]) => Promise<any>>;
};

export type PartialContract = ReadContract & {
  simulate: Record<string, (...args: any[]) => Promise<any>>;
  write: Record<string, (...args: any[]) => Promise<any>>;
  abi: Abi;
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
    const result = await method?.(payload, {
      account: getAccount(),
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

export const callWriteMethod = async <
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

  const simulateResult = await callSimulateWriteMethod({
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
    const method = contract.write[methodName];
    const tx = await method?.(payload, {
      account: getAccount(),
      chain: getChain(),
      value,
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

    if (!skipError)
      printError(err, `Error when calling write method "${methodName}"`);

    throw err;
  }
};

export const callReadMethod = async <
  T extends ReadContract,
  M extends keyof T['read'] & string,
>(
  contract: T,
  methodName: M,
  ...payload: [...Parameters<T['read'][M]>, { silent?: boolean }?]
): Promise<ReturnType<T['read'][M]>> => {
  const hideSpinner = showSpinner();
  const isSilent = payload[payload.length - 1]?.silent ?? false;

  try {
    const method = contract.read[methodName];
    const result = await method?.(...payload);
    hideSpinner();

    if (isSilent) return result;

    const base = [
      ['Method name', methodName],
      ['Contract', contract.address],
    ];

    // TODO: do message better or show in called place
    if (Array.isArray(result)) {
      logResult({
        data: [
          ...base,
          [
            'Result',
            result
              .map((r) => (typeof r === 'bigint' ? r.toString() : String(r)))
              .join(', '),
          ],
        ],
      });
    } else if (typeof result === 'object' && result !== null) {
      // Expand result object into multiple rows
      const expandedResult: Record<string, string> = {};
      for (const [k, v] of Object.entries(result)) {
        expandedResult[k] = typeof v === 'bigint' ? v.toString() : String(v);
      }
      logResult({
        data: [...base, ...Object.entries(expandedResult)],
      });
    } else {
      logResult({
        data: [
          ...base,
          ['Result', typeof result === 'bigint' ? result.toString() : result],
        ],
      });
    }

    return result;
  } catch (err) {
    hideSpinner();
    printError(
      err,
      `Error when calling read method ${methodName}@${contract.address}`,
    );

    throw err;
  }
};

export const callReadMethodSilent = async <
  T extends ReadContract,
  M extends keyof T['read'] & string,
>(
  contract: T,
  methodName: M,
  ...payload: Parameters<T['read'][M]>
): Promise<ReturnType<T['read'][M]>> => {
  return callReadMethod(contract, methodName, ...payload, {
    silent: true,
  });
};

export const isContractAddress = async (address: Address) => {
  const publicClient = getPublicClient();
  const bytecode = await publicClient.getCode({
    address: address,
  });

  return bytecode !== undefined && bytecode !== '0x';
};

export const populateWriteTx = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(args: {
  contract: T;
  methodName: M;
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[];
}): Promise<Hex> => {
  const { contract, methodName, payload } = args;

  return encodeFunctionData({
    abi: contract.abi,
    functionName: methodName as any,
    args: payload as any,
  });
};

export const callWriteMethodWithReceipt = async <
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
  if (program.opts().populateTx) {
    const data = await populateWriteTx({
      contract,
      methodName,
      payload,
    });
    logInfo('Populated transaction data:', data);
    logResult({
      data: [
        ['Method name', methodName],
        ['Contract', contract.address],
        ['Value', value ? value.toString() : '0'],
      ],
    });

    return { receipt: undefined as any, tx: data as any };
  }
  const publicClient = getPublicClient();

  const tx = await callWriteMethod({
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

    if (!skipError)
      printError(err, 'Error when waiting for transaction receipt');

    throw err;
  }
};
