import { Address, SimulateContractReturnType, TransactionReceipt } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';

import { getAccount, getPublicClient } from 'providers';
import { getChain } from 'configs';

import { showSpinner, printError, logResult, logError } from 'utils';

export type ReadContract = {
  address: Address;
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
): Promise<SimulateContractReturnType> => {
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
    const cause = (err as any).cause;
    const signature = cause?.signature;

    if (signature === '0x3fb579ad') {
      logError('Known error: ReportTooOld(uint64,uint64)');
    }

    printError(err, `Error when simulating write method "${methodName}"`);
    throw err;
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
): Promise<Address> => {
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

    throw new Error('Simulation failed');
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

    logResult({
      'Method name': methodName,
      Contract: contract.address,
      Transaction: tx,
    });

    return tx;
  } catch (err) {
    hideSpinner();
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

    const base = {
      'Method name': methodName,
      Contract: contract.address,
    };

    // TODO: do message better or show in called place
    if (Array.isArray(result)) {
      logResult({
        ...base,
        Result: result
          .map((r) => (typeof r === 'bigint' ? r.toString() : String(r)))
          .join(', '),
      });
    } else if (typeof result === 'object' && result !== null) {
      // Expand result object into multiple rows
      const expandedResult: Record<string, string> = {};
      for (const [k, v] of Object.entries(result)) {
        expandedResult[k] = typeof v === 'bigint' ? v.toString() : String(v);
      }
      logResult({
        ...base,
        ...expandedResult,
      });
    } else {
      logResult({
        ...base,
        Result: typeof result === 'bigint' ? result.toString() : result,
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
): Promise<{ receipt: TransactionReceipt; tx: Address }> => {
  const publicClient = getPublicClient();

  const tx = await callWriteMethod(contract, methodName, payload, value);

  const hideSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Waiting for transaction receipt...',
  });

  try {
    const receipt = await waitForTransactionReceipt(publicClient, { hash: tx });
    hideSpinner();

    logResult({
      'Method name': methodName,
      Contract: contract.address,
      'Transaction status': receipt.status,
      'Transaction block number': Number(receipt.blockNumber),
      'Transaction gas used': Number(receipt.gasUsed),
    });

    return { receipt, tx };
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when waiting for transaction receipt');

    throw err;
  }
};
