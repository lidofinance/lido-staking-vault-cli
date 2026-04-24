import { Address } from 'viem';

import { addressPrompt, stringToAddress } from 'utils';
import { getGenericStrategyContract } from 'contracts/defi-wrapper/index.js';

export const promptStrategy = async (strategyAddress?: Address) => {
  if (!strategyAddress) {
    const strategyPrompt = await addressPrompt(
      'Enter strategy contract address',
      'strategy',
    );
    strategyAddress = stringToAddress(strategyPrompt.strategy);
  }
  return getGenericStrategyContract(strategyAddress);
};
