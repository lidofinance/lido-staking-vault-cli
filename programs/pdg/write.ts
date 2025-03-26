import { Address, Hex } from 'viem';

import { getPredepositGuaranteeContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmCreateProof,
  createPDGProof,
  showSpinner,
  printError,
  parseObjectsArray,
  stringToBigInt,
  stringToBigIntArray,
  etherToWei,
} from 'utils';

import { pdg } from './main.js';

interface Deposit {
  pubkey: Hex;
  signature: Hex;
  amount: bigint;
  depositDataRoot: Hex;
}

pdg
  .command('predeposit')
  .description('predeposit')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits')
  .action(async (vault: Address, deposits: string) => {
    const pdgContract = await getPredepositGuaranteeContract();
    const parsedDeposits = parseObjectsArray(deposits) as Deposit[];

    await callWriteMethodWithReceipt(pdgContract, 'predeposit', [
      vault,
      parsedDeposits,
    ]);
  });

pdg
  .command('create-proof-and-prove')
  .description('create proof and prove')
  .argument('<index>', 'validator index', stringToBigInt)
  .action(async (index: bigint) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmCreateProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Creating proof...',
    });
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

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

      await callWriteMethodWithReceipt(pdgContract, 'proveValidatorWC', [
        { proof, pubkey, validatorIndex, childBlockTimestamp },
      ]);
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when creating proof');
    }
  });

pdg
  .command('prove-and-deposit')
  .description('prove and deposit')
  .argument('<indexes>', 'validator indexes', stringToBigIntArray)
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits')
  .action(async (indexes: bigint[], vault: Address, deposits: string) => {
    const pdgContract = await getPredepositGuaranteeContract();
    const parsedDeposits = parseObjectsArray(deposits) as Deposit[];

    const witnesses: {
      proof: Hex[];
      pubkey: Hex;
      validatorIndex: bigint;
      childBlockTimestamp: bigint;
    }[] = [];

    for (const index of indexes) {
      const validatorIndex = await confirmCreateProof(index);
      if (!validatorIndex) return;

      const hideSpinner = showSpinner({
        type: 'bouncingBar',
        message: 'Creating proof...',
      });
      try {
        const packageProof = await createPDGProof(Number(validatorIndex));
        hideSpinner();
        const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
          packageProof;

        witnesses.push({
          proof,
          pubkey,
          validatorIndex,
          childBlockTimestamp,
        });

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
    }

    await callWriteMethodWithReceipt(pdgContract, 'proveAndDeposit', [
      witnesses,
      parsedDeposits,
      vault,
    ]);
  });

pdg
  .command('deposit-to-beacon-chain')
  .description('deposit to beacon chain')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits')
  .action(async (vault: Address, deposits: string) => {
    const pdgContract = await getPredepositGuaranteeContract();
    const parsedDeposits = parseObjectsArray(deposits) as Deposit[];

    await callWriteMethodWithReceipt(pdgContract, 'depositToBeaconChain', [
      vault,
      parsedDeposits,
    ]);
  });

pdg
  .command('top-up')
  .description('top up no balance')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<amount>', 'amount in ETH', etherToWei)
  .action(async (nodeOperator: Address, amount: bigint) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(
      pdgContract,
      'topUpNodeOperatorBalance',
      [nodeOperator],
      amount,
    );
  });

pdg
  .command('prove-unknown-validator')
  .description('prove unknown validator')
  .argument('<index>', 'validator index', stringToBigInt)
  .argument('<vault>', 'vault address')
  .action(async (index: bigint, vault: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmCreateProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Creating proof...',
    });
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();

      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

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

      await callWriteMethodWithReceipt(pdgContract, 'proveUnknownValidator', [
        { proof, pubkey, validatorIndex, childBlockTimestamp },
        vault,
      ]);
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when proving unknown validator');
    }
  });

pdg
  .command('prove-invalid-validator-wc')
  .description('prove invalid validator withdrawal credentials')
  .argument('<index>', 'validator index', stringToBigInt)
  .argument('<invalidWithdrawalCredentials>', 'invalid withdrawal credentials')
  .action(async (index: bigint, invalidWithdrawalCredentials: Hex) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmCreateProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Creating proof...',
    });

    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();
      const { proof, pubkey, childBlockTimestamp, withdrawalCredentials } =
        packageProof;

      console.info('----------------------proof----------------------');
      console.info(proof);
      console.info('---------------------pubkey---------------------');
      console.table(pubkey);
      console.info('---------------childBlockTimestamp---------------');
      console.table(childBlockTimestamp);
      console.info('--------------withdrawalCredentials--------------');
      console.table(withdrawalCredentials);
      console.info('------------------------------------------------');
      console.info('invalid withdrawal credentials');
      console.table(invalidWithdrawalCredentials);
      console.info('-----------------------end-----------------------');

      if (withdrawalCredentials !== invalidWithdrawalCredentials) {
        console.info('withdrawal credentials are valid. Operation cancelled');
        return;
      }

      await callWriteMethodWithReceipt(pdgContract, 'proveInvalidValidatorWC', [
        { proof, pubkey, validatorIndex, childBlockTimestamp },
        invalidWithdrawalCredentials,
      ]);
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when creating proof');
    }
  });

pdg
  .command('withdraw-no-balance')
  .description('withdraw node operator balance')
  .argument('<nodeOperator>', 'node operator address')
  .argument('<amount>', 'amount in wei', stringToBigInt)
  .argument('<recipient>', 'recipient address')
  .action(async (nodeOperator: Address, amount: bigint, recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(
      pdgContract,
      'withdrawNodeOperatorBalance',
      [nodeOperator, amount, recipient],
    );
  });

pdg
  .command('set-no-g')
  .description('set node operator guarantor')
  .argument('<guarantor>', 'new guarantor address')
  .action(async (guarantor: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(pdgContract, 'setNodeOperatorGuarantor', [
      guarantor,
    ]);
  });

pdg
  .command('claim-g-refund')
  .description('claim guarantor refund')
  .argument('<recipient>', 'recipient address')
  .action(async (recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(pdgContract, 'claimGuarantorRefund', [
      recipient,
    ]);
  });

pdg
  .command('compensate-disproven-predeposit')
  .description('compensate disproven predeposit')
  .argument('<pubkey>', 'validator pubkey')
  .argument('<recipient>', 'recipient address')
  .action(async (pubkey: Hex, recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(
      pdgContract,
      'compensateDisprovenPredeposit',
      [pubkey, recipient],
    );
  });
