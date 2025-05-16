import { ReadProgramCommandConfig } from 'utils';

export const readCommandConfig: ReadProgramCommandConfig = {
  DEFAULT_ADMIN_ROLE: {
    name: 'DEFAULT_ADMIN_ROLE',
    description: 'get default admin role',
  },
  BEACON_ROOTS: {
    name: 'BEACON_ROOTS',
    description: 'get beacon roots address',
  },
  GI_FIRST_VALIDATOR: {
    name: 'GI_FIRST_VALIDATOR',
    description: 'get first validator gIndex',
  },
  GI_FIRST_VALIDATOR_AFTER_CHANGE: {
    name: 'GI_FIRST_VALIDATOR_AFTER_CHANGE',
    description: 'get first validator gIndex after change',
  },
  SLOT_CHANGE_GI_FIRST_VALIDATOR: {
    name: 'SLOT_CHANGE_GI_FIRST_VALIDATOR',
    description: 'get slot change first validator gIndex',
  },
  GI_PUBKEY_WC_PARENT: {
    name: 'GI_PUBKEY_WC_PARENT',
    description: 'get pubkey wc parent gIndex',
  },
  GI_STATE_ROOT: {
    name: 'GI_STATE_ROOT',
    description: 'get state root gIndex',
  },
  MAX_SUPPORTED_WC_VERSION: {
    name: 'MAX_SUPPORTED_WC_VERSION',
    description: 'get max supported wc version',
  },
  MIN_SUPPORTED_WC_VERSION: {
    name: 'MIN_SUPPORTED_WC_VERSION',
    description: 'get min supported wc version',
  },
  PAUSE_INFINITELY: {
    name: 'PAUSE_INFINITELY',
    description: 'get special value for the infinite pause',
  },
  PAUSE_ROLE: {
    name: 'PAUSE_ROLE',
    description: 'get pause role',
  },
  RESUME_ROLE: {
    name: 'RESUME_ROLE',
    description: 'get resume role',
  },
  PREDEPOSIT_AMOUNT: {
    name: 'PREDEPOSIT_AMOUNT',
    description: 'get amount of ether that is predeposited with each validator',
  },
  PREDEPOSIT_ROLE: {
    name: 'PREDEPOSIT_ROLE',
    description: 'get predeposit role',
  },
  STATE_ROOT_DEPTH: {
    name: 'STATE_ROOT_DEPTH',
    description: 'get state root depth',
  },
  STATE_ROOT_POSITION: {
    name: 'STATE_ROOT_POSITION',
    description: 'get state root position',
  },
  WC_PUBKEY_PARENT_DEPTH: {
    name: 'WC_PUBKEY_PARENT_DEPTH',
    description: 'get wc pubkey parent depth',
  },
  WC_PUBKEY_PARENT_POSITION: {
    name: 'WC_PUBKEY_PARENT_POSITION',
    description: 'get wc pubkey parent position',
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
    hidden: true,
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
