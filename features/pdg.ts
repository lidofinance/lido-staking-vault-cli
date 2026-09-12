import { ContractFunctionExecutionError, Hex } from 'viem';
import {
  printError,
  showSpinner,
  logResult,
  callReadMethodSilent,
  toHex,
} from 'utils';
import {
  getPredepositGuaranteeContract,
  PredepositGuaranteeContract,
} from 'contracts';

import { checkPdgIsPaused } from './deposits/pdg.js';

export const VALIDATOR_STAGES = {
  0: 'NONE',
  1: 'PREDEPOSITED',
  2: 'PROVEN',
  3: 'ACTIVATED',
  5: 'COMPENSATED',
};

/**
 * PDG renames its gindex getters when redeployed for Gloas (lidofinance/core#1940):
 * GI_FIRST_VALIDATOR_PREV/CURR become GI_FIRST_VALIDATOR_PRE_GLOAS/GI_VALIDATORS.
 * Networks are upgraded at different times and one ABI serves them all, so read
 * whichever pair the deployment actually exposes.
 */
export const readPdgGIndexes = async (
  contract: PredepositGuaranteeContract,
) => {
  try {
    const [GI_FIRST_VALIDATOR_PRE_GLOAS, GI_VALIDATORS] = await Promise.all([
      contract.read.GI_FIRST_VALIDATOR_PRE_GLOAS(),
      contract.read.GI_VALIDATORS(),
    ]);
    return { GI_FIRST_VALIDATOR_PRE_GLOAS, GI_VALIDATORS };
  } catch (err) {
    // Missing getters revert; anything else (RPC, network) is a real failure
    if (!(err instanceof ContractFunctionExecutionError)) throw err;
  }

  try {
    const [GI_FIRST_VALIDATOR_CURR, GI_FIRST_VALIDATOR_PREV] =
      await Promise.all([
        contract.read.GI_FIRST_VALIDATOR_CURR(),
        contract.read.GI_FIRST_VALIDATOR_PREV(),
      ]);
    return { GI_FIRST_VALIDATOR_CURR, GI_FIRST_VALIDATOR_PREV };
  } catch (err) {
    if (!(err instanceof ContractFunctionExecutionError)) throw err;
    // Neither layout answered: the vendored ABI no longer matches the deployment
    throw new Error(
      `PredepositGuarantee at ${contract.address} exposes neither the Gloas gindex getters ` +
        '(GI_FIRST_VALIDATOR_PRE_GLOAS/GI_VALIDATORS) nor the pre-Gloas ones ' +
        '(GI_FIRST_VALIDATOR_CURR/PREV). Check abi/PredepositGuarantee.ts against the deployed contract.',
      { cause: err },
    );
  }
};

// Get base info
export const getPdgBaseInfo = async () => {
  const hideSpinner = showSpinner();
  try {
    const contract = await getPredepositGuaranteeContract();
    const [
      DEFAULT_ADMIN_ROLE,
      RESUME_ROLE,
      PAUSE_ROLE,
      BEACON_ROOTS,
      gIndexes,
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
      contract.read.RESUME_ROLE(),
      contract.read.PAUSE_ROLE(),
      contract.read.BEACON_ROOTS(),
      readPdgGIndexes(contract),
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
      DEFAULT_ADMIN_ROLE,
      RESUME_ROLE,
      PAUSE_ROLE,
      BEACON_ROOTS,
      ...gIndexes,
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

    await checkPdgIsPaused(contract);
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

    await checkPdgIsPaused(contract);
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

    const { stage, stakingVault, nodeOperator } = await callReadMethodSilent({
      contract,
      methodName: 'validatorStatus',
      payload: [[hexValidatorPubkey]],
    });

    hideSpinner();

    const validatorStage =
      VALIDATOR_STAGES[stage as keyof typeof VALIDATOR_STAGES];
    logResult({
      data: [
        ['Validator pubkey', hexValidatorPubkey],
        ['Stage', `${validatorStage} (${stage})`],
        ['Staking vault', stakingVault],
        ['Node operator', nodeOperator],
      ],
    });

    await checkPdgIsPaused(contract);
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting validator status');
  }
};
