import { getContract, createPublicClient, http, Address } from 'viem';
import { mainnet, sepolia, holesky } from 'viem/chains';
import { CLProofVerifierAbi } from 'abi/index.js';
import { getChain, getRpcUrl } from 'configs';

const HOLESKY_CONTRACTS: Record<string, Address> = {
  CL_BEFORE_PECTRA: '0x16d7e6D314Cd378Cf2b0B3316A91995491B6A1f4',
  CL_PECTRA: '0xcc42626EDeD6a8B382AE37426F6771DDc994F387',
};

const CL_PROOF_VERIFIER_BY_CHAIN: Record<number, Address> = {
  [mainnet.id]: '0x',
  [sepolia.id]: '0x3C4Bc69e2f8B7d7BF6EB7F03E2C974D53613AAaD',
  [holesky.id]: HOLESKY_CONTRACTS.CL_PECTRA as Address,
};

export const getCLProofVerifierContract = () => {
  const chainId = getChain().id;
  const address = CL_PROOF_VERIFIER_BY_CHAIN[chainId];

  if (!address) {
    throw new Error(`CLProofVerifier contract not found for chain ${chainId}`);
  }

  return getContract({
    address,
    abi: CLProofVerifierAbi,
    client: createPublicClient({
      chain: getChain(),
      transport: http(getRpcUrl()),
    }),
  });
};
