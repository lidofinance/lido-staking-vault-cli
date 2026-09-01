import { Abi, Address, SignAuthorizationReturnType } from 'viem';
import type { Account } from 'viem';

export type ReadContract = {
  address: Address;
  read: Record<string, (...args: any[]) => Promise<any>>;
};

export type PartialContract = ReadContract & {
  simulate: Record<string, (...args: any[]) => Promise<any>>;
  write: Record<string, (...args: any[]) => Promise<any>>;
  abi: Abi;
};

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type GetFirst<T extends unknown[]> = T extends [
  infer First,
  infer _Second,
]
  ? First
  : T extends any
    ? []
    : T;

export type WriteTxArgs<
  T extends PartialContract,
  M extends keyof T['write'] & string,
> = {
  account: Account;
  contract: T;
  methodName: M;
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[];
  authorizationList?: SignAuthorizationReturnType[];
  value?: bigint;
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
};
