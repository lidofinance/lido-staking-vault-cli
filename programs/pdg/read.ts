import {
  generateReadCommands,
  parseObjectsArray,
  //printError,
  showSpinner,
} from 'utils';
import { PredepositGuaranteeAbi } from 'abi';

import { pdg } from './main.js';
import { readCommandConfig } from './config.js';
import {
  getPredepositGuaranteeContract,
  getStakingVaultContract,
} from 'contracts';
import { getBLSHarnessContract } from 'contracts/blsHarness.js';
import { isValidDeposit, expandBLSSignature } from 'utils/bls.js';

import type { Address, Hex } from 'viem';

interface Deposit {
  pubkey: Hex;
  signature: Hex;
  amount: bigint;
  depositDataRoot: Hex;
}

generateReadCommands(
  PredepositGuaranteeAbi,
  getPredepositGuaranteeContract,
  pdg,
  readCommandConfig,
);

pdg
  .command('verify-predeposit')
  .description('Verifies BLS signature of the deposit')
  .argument('<vault>', 'vault address')
  .argument('<deposits>', 'deposits')
  .action(async (vault: Address, deposits: string) => {
    //try {
    const bls = getBLSHarnessContract();
    const vaultContract = getStakingVaultContract(vault);
    let hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Loading vault metadata...',
    });
    const pdg = await getPredepositGuaranteeContract();
    const PREDEPOSIT_AMOUNT = await pdg.read.PREDEPOSIT_AMOUNT();
    const wc = await vaultContract.read.withdrawalCredentials();
    hideSpinner();
    const parsedDeposits = parseObjectsArray(deposits) as Deposit[];
    for (const parsedDeposit of parsedDeposits) {
      const deposit = parsedDeposit;

      // amount check
      if (deposit.amount !== PREDEPOSIT_AMOUNT) {
        console.info(
          `❌Deposit amount is not equal to PREDEPOSIT_AMOUNT for pubkey ${deposit.pubkey}`,
        );
      } else {
        console.info(`✅ AMOUNT VALID for Pubkey ${deposit.pubkey}`);
      }

      const check = isValidDeposit(deposit, wc);
      if (!check.isValid) {
        console.info(
          `❌ Offchain - BLS signature is not valid: ${check.reason} for Pubkey ${deposit.pubkey}`,
        );
      } else {
        console.info(`✅ SIGNATURE VALID for Pubkey ${deposit.pubkey}`);
      }

      const {
        pubkeyY_a,
        pubkeyY_b,
        sigY_c0_a,
        sigY_c0_b,
        sigY_c1_a,
        sigY_c1_b,
      } = expandBLSSignature(deposit.signature, deposit.pubkey);
      hideSpinner = showSpinner({
        type: 'bouncingBar',
        message: 'Checking onchain againts BLSHarness contract',
      });
      const isValid = await bls.read
        .verifyDepositMessage([
          deposit,
          {
            pubkeyY: { a: pubkeyY_a, b: pubkeyY_b },
            signatureY: {
              c0_a: sigY_c0_a,
              c0_b: sigY_c0_b,
              c1_a: sigY_c1_a,
              c1_b: sigY_c1_b,
            },
          },
          wc,
        ])
        .then(
          () => true,
          () => false,
        );
      hideSpinner();
      if (!isValid) {
        console.info(
          `❌ Onchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
        );
      } else {
        console.info(
          `✅ ONCHAIN 🔗 SIGNATURE VALID for Pubkey ${deposit.pubkey}`,
        );
      }
    }
    // } catch (err) {
    //   printError(err, 'Error verifying predeposits');
    // }
  });
