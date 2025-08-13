import { type Abi, type Address } from 'viem';

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
