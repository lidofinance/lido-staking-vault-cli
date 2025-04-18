import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  DEFAULT_ADMIN_ROLE: {
    name: 'default-admin-role',
    description: 'get default admin role',
  },
  DEFAULT_TIER_ADDRESS: {
    name: 'default-tier-address',
    description: 'get default tier address',
  },
  DEFAULT_TIER_ID: {
    name: 'default-tier-id',
    description: 'get default tier id',
  },
  LIDO_LOCATOR: {
    name: 'lido-locator',
    description: 'get lido locator address',
  },
  REGISTRY_ROLE: {
    name: 'registry-role',
    description: 'get registry role',
  },
  group: {
    name: 'group',
    description: 'get group by node operator address',
    arguments: {
      _nodeOperator: {
        name: 'node-operator',
        description: 'node operator address',
      },
    },
  },
  nodeOperatorAddress: {
    name: 'node-operator-address',
    description: 'get node operator address by index',
    arguments: {
      _index: {
        name: 'index',
        description: 'index',
      },
    },
  },
  nodeOperatorCount: {
    name: 'node-operator-count',
    description: 'get node operator count',
  },
  pendingRequest: {
    name: 'pending-request',
    description: 'get pending request for a node operator by index',
    arguments: {
      _nodeOperator: {
        name: 'node-operator',
        description: 'node operator address',
      },
      _index: {
        name: 'index',
        description: 'index',
      },
    },
  },
  pendingRequests: {
    name: 'pending-requests',
    description: 'get pending requests for a node operator',
    arguments: {
      _nodeOperator: {
        name: 'node-operator',
        description: 'node operator address',
      },
    },
  },
  pendingRequestsCount: {
    name: 'pending-requests-count',
    description: 'get pending requests count for a node operator',
    arguments: {
      _nodeOperator: {
        name: 'node-operator',
        description: 'node operator address',
      },
    },
  },
  tier: {
    name: 'tier',
    description: 'get tier by ID',
    arguments: {
      _tierId: {
        name: 'id',
        description: 'tier id',
      },
    },
  },
  vaultInfo: {
    name: 'vault-info',
    description: 'get vault limits',
    arguments: {
      vaultAddr: {
        name: 'vault-address',
        description: 'vault address',
      },
    },
  },
};
