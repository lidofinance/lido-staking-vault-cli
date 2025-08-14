import { Hex, type Abi, type Address } from 'viem';

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

export type PopulatedTx = { to: Address; value: bigint; data: Hex };

export type BatchTxArgs<
  T extends PartialContract,
  M extends keyof T['write'] & string,
> = {
  contract: T;
  methodName: M;
  payloads: Writeable<GetFirst<Parameters<T['write'][M]>>>[]; // array of args per call
  values?: bigint[]; // optional per-call values (defaults to 0)
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
};

export type WriteTxArgs<
  T extends PartialContract,
  M extends keyof T['write'] & string,
> = {
  contract: T;
  methodName: M;
  payload: Writeable<GetFirst<Parameters<T['write'][M]>>> | never[];
  value?: bigint;
  withSpinner?: boolean;
  silent?: boolean;
  skipError?: boolean;
};
