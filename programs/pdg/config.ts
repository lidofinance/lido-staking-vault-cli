import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  BEACON_ROOTS: {
    name: 'beacon-roots',
    description: 'get beacon roots address',
  },
  DEFAULT_ADMIN_ROLE: {
    name: 'd-admin-r',
    description: 'get default admin role',
  },
  GI_FIRST_VALIDATOR: {
    name: 'fv-gi',
    description: 'get first validator gIndex',
  },
  GI_FIRST_VALIDATOR_AFTER_CHANGE: {
    name: 'fv-gi-ac',
    description: 'get first validator gIndex after change',
  },
  SLOT_CHANGE_GI_FIRST_VALIDATOR: {
    name: 'fv-gi-sc',
    description: 'get slot change first validator gIndex',
  },
  GI_PUBKEY_WC_PARENT: {
    name: 'pw-gi',
    description: 'get pubkey wc parent gIndex',
  },
  GI_STATE_ROOT: {
    name: 'sr-gi',
    description: 'get state root gIndex',
  },
  MAX_SUPPORTED_WC_VERSION: {
    name: 'max-wc',
    description: 'get max supported wc version',
  },
  MIN_SUPPORTED_WC_VERSION: {
    name: 'min-wc',
    description: 'get min supported wc version',
  },
  isPaused: {
    name: 'is-paused',
    description: 'get is paused boolean',
  },
  nodeOperatorBalance: {
    name: 'no-bal',
    description: 'get node operator balance by address',
    arguments: {
      _nodeOperator: {
        name: 'address',
        description: 'address of the node operator',
      },
    },
  },
  unlockedBalance: {
    name: 'un-bal',
    description: 'get unlocked balance',
    arguments: {
      _nodeOperator: {
        name: 'address',
        description: 'address of the node operator',
      },
    },
  },
  nodeOperatorGuarantor: {
    name: 'no-g',
    description: 'get node operator guarantor',
    arguments: {
      _nodeOperator: {
        name: 'address',
        description: 'address of the node operator',
      },
    },
  },
  validatorStatus: {
    name: 'v-status',
    description: 'get validator status',
    arguments: {
      _validatorPubkey: {
        name: 'pubkey',
        description: 'validator pubkey',
      },
    },
  },
  getResumeSinceTimestamp: {
    name: 'resume-since-ts',
    description: 'get resume since timestamp',
  },
  claimableRefund: {
    name: 'claimable-r',
    description: 'get claimable refund',
    arguments: {
      _guarantor: {
        name: 'guarantor',
        description: 'guarantor address',
      },
    },
  },
};
