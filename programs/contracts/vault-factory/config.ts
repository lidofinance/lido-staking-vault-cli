import { ReadProgramCommandConfig, stringToAddress } from 'utils';
import { VaultFactoryAbi } from 'abi';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof VaultFactoryAbi
> = {
  deployedVaults: {
    name: 'deployed-vaults',
    description:
      'get true if the vault was deployed by this factory or PREVIOUS_FACTORY',
    arguments: {
      _vault: {
        name: 'vault',
        description: 'vault address',
        modifier: (value: string) => stringToAddress(value),
      },
    },
  },
};
