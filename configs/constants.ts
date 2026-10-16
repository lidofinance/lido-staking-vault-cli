import { Address } from 'viem';
import { hoodi, mainnet } from 'viem/chains';

export const SUPPORTED_CHAINS_LIST = [hoodi, mainnet];

// Earlier Dashboard impls whose clones are still live, keyed by chain id
export const PREVIOUS_DASHBOARD_IMPLS: Record<number, Address[]> = {
  [mainnet.id]: [],
  [hoodi.id]: [
    '0x7d25d43d5a69ae0521440211c655c11840af0fd6',
    '0x7ca203e3b7341341a4a83086780137eb283a9338',
    '0x7b2b6ea1e53b2039a493ca587805183883cb8b88',
  ],
};
