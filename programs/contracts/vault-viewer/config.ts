import { VaultViewerAbi } from 'abi';
import { ReadProgramCommandConfig, stringToAddress, stringToHex } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof VaultViewerAbi
> = {
  vaultAddressesBatch: {
    hidden: true,
    name: 'addresses-batch',
    description: 'get vault addresses for a range of vaults',
    arguments: {
      _offset: {
        name: 'offset',
        description: 'offset',
        modifier: (value) => BigInt(value),
      },
      _limit: {
        name: 'limit',
        description: 'limit',
        modifier: (value) => BigInt(value),
      },
    },
  },
  vaultsByRoleBatch: {
    name: 'by-role-address-batch',
    aliases: ['by-ra'],
    description:
      'get vaults where `_member` has `_role`, scanning a batch of the global vault list',
    arguments: {
      _role: {
        name: 'role',
        description: 'role',
        modifier: (value) => stringToHex(value),
      },
      _member: {
        name: 'member',
        description: 'member address',
        modifier: (value) => stringToAddress(value),
      },
      _offset: {
        name: 'offset',
        description: 'offset',
        modifier: (value) => BigInt(value),
      },
      _limit: {
        name: 'limit',
        description: 'limit',
        modifier: (value) => BigInt(value),
      },
    },
  },
  vaultsByOwnerBatch: {
    name: 'by-owner-batch',
    description:
      'get vaults owned by `_owner` using batch pagination over the global vault list',
    arguments: {
      _owner: {
        name: 'owner',
        description: 'owner address',
        modifier: (value) => stringToAddress(value),
      },
      _offset: {
        name: 'offset',
        description: 'offset',
        modifier: (value) => BigInt(value),
      },
      _limit: {
        name: 'limit',
        description: 'limit',
        modifier: (value) => BigInt(value),
      },
    },
  },
  hasRole: {
    name: 'has-role',
    description: 'check if an address has a role in a vault',
    arguments: {
      vault: {
        name: 'vault',
        description: 'vault address',
      },
      _role: {
        name: 'role',
        description: 'role',
      },
      _member: {
        name: 'member',
        description: 'member address',
      },
    },
  },
  vaultsDataBatch: {
    name: 'vaults-data-batch',
    description: 'get aggregated data for a batch of vaults',
    arguments: {
      _offset: {
        name: 'offset',
        description: 'offset',
        modifier: (value) => BigInt(value),
      },
      _limit: {
        name: 'limit',
        description: 'limit',
        modifier: (value) => BigInt(value),
      },
    },
  },
  vaultData: {
    name: 'vault-data',
    description: 'get aggregated data for a single vault',
    arguments: {
      vault: {
        name: 'vault',
        description: 'vault address',
        modifier: (value) => stringToAddress(value),
      },
    },
  },
  vaultsCount: {
    name: 'vaults-count',
    description: 'get the number of vaults connected to the VaultHub',
  },
  roleMembersBatch: {
    name: 'role-members-batch',
    description: 'get VaultMembers for each role on multiple vaults',
    arguments: {
      vaultAddresses: {
        name: 'vault addresses',
        description: 'array of vault addresses',
      },
      roles: {
        name: 'roles',
        description: 'array of roles',
      },
    },
  },
  roleMembers: {
    name: 'role-members',
    description:
      'get the VaultMembers for each specified role on a single vault',
    arguments: {
      vaultAddress: {
        name: 'vault',
        description: 'vault address',
        modifier: (value) => stringToAddress(value),
      },
      roles: {
        name: 'roles',
        description: 'array of roles',
      },
    },
  },
  isVaultOwner: {
    name: 'is-vault-owner',
    description: 'checks if a given address is the owner of a connection vault',
    arguments: {
      vault: {
        name: 'vault address',
        description: 'vault address',
        modifier: (value) => stringToAddress(value),
      },
      _owner: {
        name: 'owner',
        description: 'owner address',
        modifier: (value) => stringToAddress(value),
      },
    },
  },
};
