import { getContract, createPublicClient, http, Address } from 'viem';
import { hoodi } from 'viem/chains';
import { ReportCheckerAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';

const REPORT_CHECKER_BY_CHAIN: Record<number, Address> = {
  [hoodi.id]: '0x',
};

export const getReportCheckerContract = () => {
  const chainId = getChain().id;
  const address = REPORT_CHECKER_BY_CHAIN[chainId];

  if (!address) {
    throw new Error(`ReportChecker contract not found for chain ${chainId}`);
  }

  return getContract({
    address,
    abi: ReportCheckerAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getElUrl()),
    }),
  });
};
