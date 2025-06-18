import {
  printError,
  showSpinner,
  logResult,
  callReadMethodSilent,
  toHex,
} from 'utils';
import { getPredepositGuaranteeContract } from 'contracts';
import { Hex } from 'viem';

const VALIDATORS_STATUS = {
  0: 'NONE',
  1: 'PREDEPOSITED',
  2: 'PROVEN',
  3: 'DISPROVEN',
  4: 'COMPENSATED',
};

// Get base info
export const getPdgBaseInfo = async () => {
  const hideSpinner = showSpinner();
  try {
    const contract = await getPredepositGuaranteeContract();
    const [
      DEFAULT_ADMIN_ROLE,
      BEACON_ROOTS,
      GI_FIRST_VALIDATOR_CURR,
      GI_FIRST_VALIDATOR_PREV,
      GI_PUBKEY_WC_PARENT,
      GI_STATE_ROOT,
      MAX_SUPPORTED_WC_VERSION,
      MIN_SUPPORTED_WC_VERSION,
      PREDEPOSIT_AMOUNT,
      PIVOT_SLOT,
      isPaused,
      resumeSinceTimestamp,
    ] = await Promise.all([
      contract.read.DEFAULT_ADMIN_ROLE(),
      contract.read.BEACON_ROOTS(),
      contract.read.GI_FIRST_VALIDATOR_CURR(),
      contract.read.GI_FIRST_VALIDATOR_PREV(),
      contract.read.GI_PUBKEY_WC_PARENT(),
      contract.read.GI_STATE_ROOT(),
      contract.read.MAX_SUPPORTED_WC_VERSION(),
      contract.read.MIN_SUPPORTED_WC_VERSION(),
      contract.read.PREDEPOSIT_AMOUNT(),
      contract.read.PIVOT_SLOT(),
      contract.read.isPaused(),
      contract.read.getResumeSinceTimestamp(),
    ]);

    const CONTRACT_ADDRESS = contract.address;

    hideSpinner();

    const payload = {
      CONTRACT_ADDRESS,
      BEACON_ROOTS,
      DEFAULT_ADMIN_ROLE,
      GI_FIRST_VALIDATOR_CURR,
      GI_FIRST_VALIDATOR_PREV,
      GI_PUBKEY_WC_PARENT,
      GI_STATE_ROOT,
      MAX_SUPPORTED_WC_VERSION,
      MIN_SUPPORTED_WC_VERSION,
      PREDEPOSIT_AMOUNT,
      PIVOT_SLOT,
      isPaused,
      resumeSinceTimestamp,
    };

    logResult({
      data: Object.entries(payload).map(([key, value]) => [key, value]),
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};

export const getPdgRoles = async () => {
  const hideSpinner = showSpinner();

  try {
    const contract = await getPredepositGuaranteeContract();

    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const RESUME_ROLE = await contract.read.RESUME_ROLE();
    const PAUSE_ROLE = await contract.read.PAUSE_ROLE();

    const roles = {
      DEFAULT_ADMIN_ROLE,
      RESUME_ROLE,
      PAUSE_ROLE,
    };

    const result = await Promise.all(
      Object.entries(roles).map(async ([key, value]) => {
        const accounts = await contract.read.getRoleMembers([value]);
        return {
          Role: key,
          Keccak: value,
          Members: accounts.length > 0 ? accounts.join(', ') : 'None',
        };
      }),
    );
    hideSpinner();
    logResult({
      data: result.map(({ Role, Keccak, Members }) => [Role, Keccak, Members]),
      params: {
        head: ['Role', 'Keccak', 'Members'],
      },
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting roles');
  }
};

export const getValidatorStatus = async (validatorPubkey: Hex) => {
  const hideSpinner = showSpinner();
  const hexValidatorPubkey = toHex(validatorPubkey);

  try {
    const contract = await getPredepositGuaranteeContract();

    const { stage, stakingVault, nodeOperator } = await callReadMethodSilent(
      contract,
      'validatorStatus',
      [hexValidatorPubkey],
    );

    hideSpinner();

    const status = VALIDATORS_STATUS[stage as keyof typeof VALIDATORS_STATUS];
    logResult({
      data: [
        ['Validator pubkey', hexValidatorPubkey],
        ['Status', `${status} (${stage})`],
        ['Staking vault', stakingVault],
        ['Node operator', nodeOperator],
      ],
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting validator status');
  }
};
