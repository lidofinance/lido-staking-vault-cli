import { mainnet } from 'viem/chains';
import { PredepositGuaranteeContract } from 'contracts';
import { callReadMethodSilent, logInfo } from 'utils';
import { getChain } from 'configs';

export const checkPdgIsPaused = async (
  pdgContract: PredepositGuaranteeContract,
) => {
  const chain = await getChain();
  const isMainnet = chain.id === mainnet.id;

  const isPaused = await callReadMethodSilent({
    contract: pdgContract,
    methodName: 'isPaused',
    payload: [],
  });

  if (isPaused) {
    const message = isMainnet
      ? 'PredepositGuarantee contract is paused until Phase 2'
      : 'PredepositGuarantee contract is paused until Mainnet Voting starts';
    logInfo('⚠️ '.repeat(10));
    logInfo(message);
    logInfo('⚠️ '.repeat(10));
  }

  return isPaused;
};
