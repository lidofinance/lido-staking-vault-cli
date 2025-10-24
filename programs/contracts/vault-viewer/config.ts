import { VaultViewerAbi } from 'abi';
import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof VaultViewerAbi
> = {
  vaultsConnected: {
    hidden: true,
    name: 'connected',
    description: 'get vaults connected to vault hub',
  },
  vaultsByRole: {
    name: 'by-role-address',
    aliases: ['by-ra'],
    description: 'get vaults by role and address',
    arguments: {
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
  vaultsConnectedBound: {
    name: 'connected-bound',
    description: 'get vaults connected to vault hub - bound',
    arguments: {
      _from: {
        name: 'from',
        description: 'from',
      },
      _to: {
        name: 'to',
        description: 'to',
      },
    },
  },
  vaultsByRoleBound: {
    name: 'by-role-address-bound',
    aliases: ['by-ra-b'],
    description: 'get vaults by role and address - bound',
    arguments: {
      _role: {
        name: 'role',
        description: 'role',
      },
      _member: {
        name: 'member',
        description: 'member address',
      },
      _from: {
        name: 'from',
        description: 'from',
      },
      _to: {
        name: 'to',
        description: 'to',
      },
    },
  },
  vaultsByOwner: {
    name: 'by-owner',
    description: 'get vaults by owner',
    arguments: {
      _owner: {
        name: 'owner',
        description: 'owner address',
      },
    },
  },
  vaultsByOwnerBound: {
    name: 'by-owner-bound',
    description: 'get vaults by owner - bound',
    arguments: {
      _owner: {
        name: 'owner',
        description: 'owner address',
      },
      _from: {
        name: 'from',
        description: 'from',
      },
      _to: {
        name: 'to',
        description: 'to',
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
  isOwner: {
    name: 'is-owner',
    description: 'check if an address is the owner of a vault',
    arguments: {
      vault: {
        name: 'vault',
        description: 'vault address',
      },
      _owner: {
        name: 'owner',
        description: 'owner address',
      },
    },
  },
};
