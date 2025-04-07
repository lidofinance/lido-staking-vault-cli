import {
  callReadMethod,
  Deposit,
  generateReadCommands,
  parseDepositArray,
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
import { Option } from 'commander';

generateReadCommands(
  PredepositGuaranteeAbi,
  getPredepositGuaranteeContract,
  pdg,
  readCommandConfig,
);

pdg
  .command('verify-predeposit')
  .description('Verifies BLS signature of the deposit')
  .addOption(new Option('-vt, --vault [vault]', 'vault address'))
  .addOption(
    new Option('-wc, --withdrawalCredentials [wc]', 'withdrawal credentials'),
  )
  .argument('<deposits>', 'deposits', parseDepositArray)
  .action(
    async (
      deposits: Deposit[],
      options: { vault: Address; withdrawalCredentials: Hex },
    ) => {
      // eslint-disable-next-line prefer-const
      let { vault, withdrawalCredentials } = options;

      if (!vault && !withdrawalCredentials) {
        throw new Error(
          'You must provide either vault or withdrawal credentials',
        );
      } else if (vault && withdrawalCredentials) {
        throw new Error(
          'You can only provide one of vault or withdrawal credentials',
        );
      }
      const bls = getBLSHarnessContract();
      let hideSpinner = showSpinner({
        type: 'bouncingBar',
        message: 'Loading metadata...',
      });
      const pdg = await getPredepositGuaranteeContract();
      const PREDEPOSIT_AMOUNT = await callReadMethod(pdg, 'PREDEPOSIT_AMOUNT');
      if (!PREDEPOSIT_AMOUNT) return;

      if (vault) {
        const vaultContract = getStakingVaultContract(vault);
        const wc = await callReadMethod(vaultContract, 'withdrawalCredentials');
        if (!wc) return;
        withdrawalCredentials = wc;
      }
      hideSpinner();

      for (const deposit of deposits) {
        // amount check
        if (deposit.amount !== PREDEPOSIT_AMOUNT) {
          console.info(
            `❌Deposit amount is not equal to PREDEPOSIT_AMOUNT for pubkey ${deposit.pubkey}`,
          );
        } else {
          console.info(`✅ AMOUNT VALID for Pubkey ${deposit.pubkey}`);
        }

        const check = isValidDeposit(deposit, withdrawalCredentials);
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
            withdrawalCredentials,
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
    },
  );
