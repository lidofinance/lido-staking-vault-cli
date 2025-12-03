import { Hex, formatEther } from 'viem';

import {
  logInfo,
  logResult,
  logTable,
  printError,
  showSpinner,
  createPDGProof,
  ValidatorWitness,
  confirmMakeProof,
  callReadMethodSilent,
} from 'utils';
import {
  PredepositGuaranteeContract,
  getStakingVaultContract,
} from 'contracts';
import { VALIDATOR_STAGES } from 'features/pdg.js';

export const checkValidatorStageAndStagedBalanceForActivation = async (
  pdgContract: PredepositGuaranteeContract,
  pubkey: Hex,
) => {
  const { stage, stakingVault } = await callReadMethodSilent(
    pdgContract,
    'validatorStatus',
    [pubkey],
  );
  const vaultStagedBalance = await callReadMethodSilent(
    await getStakingVaultContract(stakingVault),
    'stagedBalance',
  );
  const ACTIVATION_DEPOSIT_AMOUNT = await callReadMethodSilent(
    pdgContract,
    'ACTIVATION_DEPOSIT_AMOUNT',
  );

  if (vaultStagedBalance < ACTIVATION_DEPOSIT_AMOUNT) {
    throw new Error(
      `Staged balance is less than ${formatEther(ACTIVATION_DEPOSIT_AMOUNT)} ETH (current: ${formatEther(vaultStagedBalance)} ETH)`,
    );
  }

  const validatorStage =
    VALIDATOR_STAGES[stage as keyof typeof VALIDATOR_STAGES];
  if (validatorStage !== 'PREDEPOSITED') {
    throw new Error(
      `Validator is not in PREDEPOSITED stage (current: ${validatorStage}, ${stage})`,
    );
  }

  return { stage, stakingVault, vaultStagedBalance, ACTIVATION_DEPOSIT_AMOUNT };
};

export const makePDGProofByIndex = async (validatorIndex: number) => {
  const hideSpinner = showSpinner({
    type: 'bouncingBar',
    message: 'Making proof...',
  });
  try {
    const packageProof = await createPDGProof(Number(validatorIndex));
    hideSpinner();
    const {
      proof,
      pubkey,
      childBlockTimestamp,
      withdrawalCredentials,
      slot,
      proposerIndex,
    } = packageProof;

    logResult({});
    logInfo('----------------------proof----------------------');
    logInfo(proof);
    logInfo('-------------------------------------------------');
    logTable({
      data: [
        ['Pubkey', pubkey],
        ['Child Block Timestamp', childBlockTimestamp],
        ['Withdrawal Credentials', withdrawalCredentials],
        ['Slot', slot],
        ['Proposer Index', proposerIndex],
      ],
    });
    logInfo('-----------------------end-----------------------');

    return packageProof;
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when making proof');
    throw err;
  }
};

export const makePDGProofByIndexes = async (indexes: number[]) => {
  const witnesses: ValidatorWitness[] = [];

  for (const index of indexes) {
    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const packageProof = await makePDGProofByIndex(validatorIndex);
    const { proof, pubkey, childBlockTimestamp, slot, proposerIndex } =
      packageProof;

    witnesses.push({
      proof,
      pubkey,
      validatorIndex: BigInt(validatorIndex),
      childBlockTimestamp,
      slot,
      proposerIndex,
    });
  }

  return witnesses;
};
