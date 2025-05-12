import { printError, showSpinner, logResult } from 'utils';
import { getPredepositGuaranteeContract } from 'contracts';

// Get base info
export const getPdgBaseInfo = async () => {
  const hideSpinner = showSpinner();
  try {
    const contract = await getPredepositGuaranteeContract();

    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const BEACON_ROOTS = await contract.read.BEACON_ROOTS();
    const GI_FIRST_VALIDATOR = await contract.read.GI_FIRST_VALIDATOR();
    const GI_FIRST_VALIDATOR_AFTER_CHANGE =
      await contract.read.GI_FIRST_VALIDATOR_AFTER_CHANGE();
    const GI_PUBKEY_WC_PARENT = await contract.read.GI_PUBKEY_WC_PARENT();
    const GI_STATE_ROOT = await contract.read.GI_STATE_ROOT();
    const MAX_SUPPORTED_WC_VERSION =
      await contract.read.MAX_SUPPORTED_WC_VERSION();
    const MIN_SUPPORTED_WC_VERSION =
      await contract.read.MIN_SUPPORTED_WC_VERSION();
    const PREDEPOSIT_AMOUNT = await contract.read.PREDEPOSIT_AMOUNT();
    const SLOT_CHANGE_GI_FIRST_VALIDATOR =
      await contract.read.SLOT_CHANGE_GI_FIRST_VALIDATOR();
    const isPaused = await contract.read.isPaused();
    const resumeSinceTimestamp = await contract.read.getResumeSinceTimestamp();
    const STATE_ROOT_DEPTH = await contract.read.STATE_ROOT_DEPTH();
    const STATE_ROOT_POSITION = await contract.read.STATE_ROOT_POSITION();
    const WC_PUBKEY_PARENT_DEPTH = await contract.read.WC_PUBKEY_PARENT_DEPTH();
    const WC_PUBKEY_PARENT_POSITION =
      await contract.read.WC_PUBKEY_PARENT_POSITION();

    const CONTRACT_ADDRESS = contract.address;

    hideSpinner();

    const payload = {
      CONTRACT_ADDRESS,
      BEACON_ROOTS,
      DEFAULT_ADMIN_ROLE,
      GI_FIRST_VALIDATOR,
      GI_FIRST_VALIDATOR_AFTER_CHANGE,
      GI_PUBKEY_WC_PARENT,
      GI_STATE_ROOT,
      MAX_SUPPORTED_WC_VERSION,
      MIN_SUPPORTED_WC_VERSION,
      PREDEPOSIT_AMOUNT,
      SLOT_CHANGE_GI_FIRST_VALIDATOR,
      isPaused,
      resumeSinceTimestamp,
      STATE_ROOT_DEPTH,
      STATE_ROOT_POSITION,
      WC_PUBKEY_PARENT_DEPTH,
      WC_PUBKEY_PARENT_POSITION,
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
