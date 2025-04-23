import { getContract, createPublicClient, http, Address } from 'viem';
import { hoodi } from 'viem/chains';
import { CLProofVerifierAbi } from 'abi/index.js';
import { getChain, getElUrl } from 'configs';

const CL_PROOF_VERIFIER_BY_CHAIN: Record<number, Address> = {
  [hoodi.id]: '0x',
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
      transport: http(getElUrl()),
    }),
  });
};
