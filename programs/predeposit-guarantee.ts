import { program } from 'command';
import { getCLProofVerifierContract } from 'contracts';

import {
  createPDGProof,
  getFirstValidatorGIndex,
  confirmCreateProof,
  showSpinner,
  printError,
} from 'utils/index.js';

const predepositGuaranteeHelpers = program
  .command('pdg-helpers')
  .description('predeposit guarantee helpers');

predepositGuaranteeHelpers
  .command('create-proof-and-check')
  .option('-i, --index <index>', 'validator index')
  .description(
    'create predeposit proof by validator index and check by test contract',
  )
  .action(async ({ index }: { index: bigint }) => {
    const validatorIndex = await confirmCreateProof(index);
    if (!validatorIndex) return;

    const clProofVerifierContract = getCLProofVerifierContract();

    const hideSpinner = showSpinner();
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      await clProofVerifierContract.read.TEST_validatePubKeyWCProof([
        { proof, pubkey, validatorIndex, childBlockTimestamp },
        withdrawalCredentials,
      ]);

      console.info('-----------------proof verified-----------------');
      console.info('------------------------------------------------');
      console.info('----------------------proof----------------------');
      console.info(proof);
      console.info('---------------------pubkey---------------------');
      console.table(pubkey);
      console.info('---------------childBlockTimestamp---------------');
      console.table(childBlockTimestamp);
      console.info('--------------withdrawalCredentials--------------');
      console.table(withdrawalCredentials);
      console.info('------------------------------------------------');
      console.info('-----------------------end-----------------------');
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when creating proof');
    }
  });

predepositGuaranteeHelpers
  .command('create-proof')
  .description('create predeposit proof by validator index')
  .option('-i, --index <index>', 'validator index')
  .action(async ({ index }: { index: bigint }) => {
    const validatorIndex = await confirmCreateProof(index);
    if (!validatorIndex) return;

    const packageProof = await createPDGProof(Number(validatorIndex));
    const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
      packageProof;

    console.info('-----------------proof verified-----------------');
    console.info('------------------------------------------------');
    console.info('----------------------proof----------------------');
    console.info(proof);
    console.info('---------------------pubkey---------------------');
    console.table(pubkey);
    console.info('---------------childBlockTimestamp---------------');
    console.table(childBlockTimestamp);
    console.info('--------------withdrawalCredentials--------------');
    console.table(withdrawalCredentials);
    console.info('------------------------------------------------');
    console.info('-----------------------end-----------------------');
  });

predepositGuaranteeHelpers
  .command('fv-gindex')
  .argument('<forks...>', 'fork name')
  .description('get first validator gindex')
  .action(async (forks: string[]) => {
    getFirstValidatorGIndex(forks);
  });
