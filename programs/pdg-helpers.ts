import { program } from 'command';
import { Option } from 'commander';

import { getCLProofVerifierContract } from 'contracts';
import {
  createPDGProof,
  getFirstValidatorGIndex,
  confirmMakeProof,
  showSpinner,
  printError,
  computeDepositDataRoot,
  logResult,
  logInfo,
  getCommandsJson,
} from 'utils';

const predepositGuaranteeHelpers = program
  .command('pdg-helpers')
  .description('predeposit guarantee helpers');

predepositGuaranteeHelpers.addOption(new Option('-cmd2json'));
predepositGuaranteeHelpers.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(predepositGuaranteeHelpers));
  process.exit();
});

predepositGuaranteeHelpers
  .command('proof-and-check')
  .aliases(['proof-check'])
  .option('-i, --index <index>', 'validator index')
  .description(
    'make predeposit proof by validator index and check by test contract',
  )
  .action(async ({ index }: { index: bigint }) => {
    const validatorIndex = await confirmMakeProof(index);
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

      logInfo('-----------------proof verified-----------------');
      logInfo('------------------------------------------------');
      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logInfo('---------------------pubkey---------------------');
      logResult(pubkey);
      logInfo('---------------childBlockTimestamp---------------');
      logResult(childBlockTimestamp);
      logInfo('--------------withdrawalCredentials--------------');
      logResult(withdrawalCredentials);
      logInfo('------------------------------------------------');
      logInfo('-----------------------end-----------------------');
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

predepositGuaranteeHelpers
  .command('proof')
  .description('make predeposit proof by validator index')
  .option('-i, --index <index>', 'validator index')
  .action(async ({ index }: { index: bigint }) => {
    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner();
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      logInfo('-----------------proof verified-----------------');
      logInfo('------------------------------------------------');
      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logInfo('---------------------pubkey---------------------');
      logResult(pubkey);
      logInfo('---------------childBlockTimestamp---------------');
      logResult(childBlockTimestamp);
      logInfo('--------------withdrawalCredentials--------------');
      logResult(withdrawalCredentials);
      logInfo('------------------------------------------------');
      logInfo('-----------------------end-----------------------');
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

predepositGuaranteeHelpers
  .command('fv-gindex')
  .argument('<forks...>', 'fork name')
  .description('get first validator gindex')
  .action(async (forks: string[]) => {
    getFirstValidatorGIndex(forks);
  });

predepositGuaranteeHelpers
  .command('compute-deposit-data-root')
  .aliases(['compute-dd-root'])
  .description('compute deposit data root')
  .argument('<pubkey>', 'pubkey')
  .argument('<withdrawal-credentials>', 'withdrawal credentials')
  .argument('<signature>', 'signature')
  .argument('<amount>', 'amount in ETH')
  .action(
    async (
      pubkey: string,
      withdrawalCredentials: string,
      signature: string,
      amount: string,
    ) => {
      const result = computeDepositDataRoot(
        pubkey,
        withdrawalCredentials,
        signature,
        amount,
      );

      logResult({
        pubkey,
        withdrawalCredentials,
        signature,
        amount,
        depositDataRoot: result,
      });
    },
  );
