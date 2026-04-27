import { GenericStrategyAbi } from 'abi/defi-wrapper/index.js';
import { ReadProgramCommandConfig, stringToAddress } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof GenericStrategyAbi
> = {
  getStrategyCallForwarderAddress: {
    hidden: true,
  },
  isAllowListed: {
    name: 'is-allow-listed',
    description: 'get whether the address is allow listed',
    arguments: {
      _user: {
        name: 'user',
        description: 'user address',
        modifier: stringToAddress,
      },
    },
  },
  mintedStethSharesOf: {
    name: 'minted-steth-shares-of',
    description: 'get the minted stETH shares for a user',
    arguments: {
      _user: {
        name: 'user',
        description: 'user address',
        modifier: stringToAddress,
      },
    },
  },
  wstethOf: {
    name: 'wsteth-of',
    description: 'get the wstETH balance of a user',
    arguments: {
      _user: {
        name: 'user',
        description: 'user address',
        modifier: stringToAddress,
      },
    },
  },
};
