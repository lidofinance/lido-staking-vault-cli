import { getContract, createPublicClient, http, Address } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { ReportCheckerAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';

const REPORT_CHECKER_BY_CHAIN: Record<number, Address> = {
  [mainnet.id]: '0x',
  [sepolia.id]: '0x2D271F259b54BE7d61bbFE9ac464E06eccCe6df5',
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
