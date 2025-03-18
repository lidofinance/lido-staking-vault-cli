import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  vaultsConnected: {
    name: 'connected',
    description: 'get vaults connected to vault hub',
  },
  vaultsByRole: {
    name: 'by-ra',
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
    name: 'by-ra-bound',
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
};
