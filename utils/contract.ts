import { printError } from 'utils';
import { getAccount, getPublicClient } from 'providers';
import { getChain } from 'configs';
import { Address } from 'viem';

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type GetFirst<T extends unknown[]> = T extends [infer First, infer _Second]
  ? First
  : T extends any
    ? []
    : T;

export const callWriteMethod = async <
  T extends { write: Record<string, (...args: any[]) => Promise<any>> },
  M extends keyof T['write'] & string,
>(
  contract: T,
  methodName: M,
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[],
  value?: bigint,
) => {
  try {
    const method = contract.write[methodName];
    const tx = await method?.(payload, {
      account: getAccount(),
      chain: getChain(),
      value,
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, `Error when calling write method ${methodName}`);
  }
};

export const callReadMethod = async <
  T extends { read: Record<string, (...args: any[]) => Promise<any>> },
  M extends keyof T['read'] & string,
>(
  contract: T,
  methodName: M,
  ...payload: Parameters<T['read'][M]>
) => {
  try {
    const method = contract.read[methodName];
    const result = await method?.(payload);
    // TODO: do message better or show in called place
    console.table({ Result: result });

    return result;
  } catch (err) {
    printError(err, `Error when calling read method ${methodName}`);
  }
};

export const isContractAddress = async (address: Address) => {
  const publicClient = getPublicClient();
  const bytecode = await publicClient.getCode({
    address: address,
  });

  return bytecode !== undefined;
};
