import { getContract, createPublicClient, http, Address } from 'viem';
import { hoodi, sepolia } from 'viem/chains';
import { BLSHarnessAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';

const BLS_HARNESS_BY_CHAIN: Record<number, Address> = {
  [sepolia.id]: '0xa88f0329c2c4ce51ba3fc619bbf44efe7120dd0d',
  [hoodi.id]: '0xa88f0329C2c4ce51ba3fc619BBf44efE7120Dd0d',
};

export const getBLSHarnessContract = () => {
  const chainId = getChain().id;
  const address = BLS_HARNESS_BY_CHAIN[chainId];

  if (!address) {
    throw new Error(`BLSHarness contract not found for chain ${chainId}`);
  }

  return getContract({
    address,
    abi: BLSHarnessAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getElUrl()),
    }),
  });
};
