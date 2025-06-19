import {
  logInfo,
  logResult,
  logTable,
  printError,
  showSpinner,
  createPDGProof,
  ValidatorWitness,
  confirmMakeProof,
} from 'utils';

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
