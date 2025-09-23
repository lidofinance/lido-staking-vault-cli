import { ReadProgramCommandConfig } from 'utils';
import { PredepositGuaranteeAbi } from 'abi';

export const readCommandConfig: ReadProgramCommandConfig<
  typeof PredepositGuaranteeAbi
> = {
  DEFAULT_ADMIN_ROLE: {
    name: 'DEFAULT_ADMIN_ROLE',
    description: 'get default admin role',
  },
  BEACON_ROOTS: {
    name: 'BEACON_ROOTS',
    description: 'get beacon roots address',
  },
  GI_FIRST_VALIDATOR_CURR: {
    name: 'GI_FIRST_VALIDATOR_CURR',
    description:
      'get GIndex of first validator in CL state tree after PIVOT_SLOT',
  },
  GI_FIRST_VALIDATOR_PREV: {
    name: 'GI_FIRST_VALIDATOR_PREV',
    description: 'get GIndex of first validator in CL state tree',
  },
  PIVOT_SLOT: {
    name: 'PIVOT_SLOT',
    description: 'get slot when GIndex change will occur due to the hardfork',
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
  ACTIVATION_DEPOSIT_AMOUNT: {
    name: 'ACTIVATION_DEPOSIT_AMOUNT',
    description:
      'get amount of ether to be deposited after the predeposit to activate the validator',
  },
  DEPOSIT_DOMAIN: {
    name: 'DEPOSIT_DOMAIN',
    description: 'get computed DEPOSIT_DOMAIN for current chain',
  },
  nodeOperatorDepositor: {
    name: 'node-operator-depositor',
    description: 'get address of the depositor for the NO',
    arguments: {
      _nodeOperator: {
        name: 'address',
        description: 'address of the node operator',
      },
    },
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
  validatePubKeyWCProof: {
    name: 'validate-pubkey-wc-proof',
    description:
      'validates proof of validator in CL with withdrawalCredentials and pubkey against Beacon block root',
    arguments: {
      _witness: {
        name: 'witness',
        description: 'validator witness',
      },
      _withdrawalCredentials: {
        name: 'withdrawal-credentials',
        description: 'withdrawal credentials to verify proof with',
      },
    },
  },
  verifyDepositMessage: {
    name: 'verify-deposit-message',
    description:
      'verifies the deposit message signature using BLS12-381 pairing check',
    arguments: {
      _deposit: {
        name: 'deposit',
        description: 'staking vault deposit to verify',
      },
      _depositsY: {
        name: 'depositsY',
        description:
          'Y coordinates of the two BLS12-381 points (uncompressed pubkey and signature)',
      },
      _withdrawalCredentials: {
        name: 'withdrawal-credentials',
        description: 'withdrawal credentials of the deposit message to verify',
      },
    },
  },
  pendingPredeposits: {
    hidden: true,
  },
};
