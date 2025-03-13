import { Address, Hex } from 'viem';

import { getPredepositGuaranteeContract } from 'contracts';
import {
  callWriteMethodWithReceipt,
  confirmCreateProof,
  createPDGProof,
  showSpinner,
  printError,
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
  .action(async (vault: Address, deposits: Deposit[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(pdgContract, 'predeposit', [
      vault,
      deposits,
    ]);
  });

pdg
  .command('create-proof-and-prove')
  .description('create proof and prove')
  .argument('<index>', 'validator index')
  .action(async (index: bigint) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmCreateProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner();
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
  .command('deposit-to-beacon-chain')
  .description('deposit to beacon chain')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits')
  .action(async (vault: Address, deposits: Deposit[]) => {
    const pdgContract = await getPredepositGuaranteeContract();

    await callWriteMethodWithReceipt(pdgContract, 'depositToBeaconChain', [
      vault,
      deposits,
    ]);
  });
