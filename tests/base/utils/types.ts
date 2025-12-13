import type { Address } from 'viem';

export type ReadContract = {
  address: Address;
  read: Record<string, (...args: any[]) => Promise<any>>;
};
