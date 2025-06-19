import { type Address } from 'viem';
import { Option } from 'commander';

import {
  logInfo,
  getCommandsJson,
  stringToAddress,
  confirmOperation,
  callWriteMethodWithReceipt,
  parseDepositArray,
  expandBLSSignature,
  confirmMakeProof,
  stringToNumberArray,
  stringToNumber,
} from 'utils';
import {
  chooseVaultAndGetDashboard,
  checkBLSDeposits,
  makePDGProofByIndex,
  makePDGProofByIndexes,
} from 'features';
import { Deposit } from 'types';
import {
  getPredepositGuaranteeContract,
  getStakingVaultContract,
} from 'contracts';

import { deposits } from './main.js';

const depositsWrite = deposits
  .command('write')
  .aliases(['w'])
  .description('vault operations write commands');

depositsWrite.addOption(new Option('-cmd2json'));
depositsWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(depositsWrite));
  process.exit();
});

depositsWrite
  .command('predeposit')
  .description(
    "deposits NO's validators with PREDEPOSIT_AMOUNT ether from StakingVault and locks up NO's balance",
  )
  .argument('<deposits>', 'deposits', parseDepositArray)
  .option('--no-bls-check', 'skip bls signature check')
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .addHelpText(
    'after',
    `Deposit format:
  '[{
    "pubkey": "...",
    "signature": "...",
    "amount": "...",
    "deposit_data_root": "..."
  }
  {second deposit}
  ...]'`,
  )
  .action(
    async (
      deposits: Deposit[],
      { vault, blsCheck }: { vault: Address; blsCheck: boolean },
    ) => {
      const { vault: vaultAddress } = await chooseVaultAndGetDashboard(vault);
      const pdgContract = await getPredepositGuaranteeContract();
      const vaultContract = getStakingVaultContract(vaultAddress);

      if (blsCheck)
        await checkBLSDeposits(pdgContract, vaultContract, deposits);

      const depositsY = deposits.map((deposit) => {
        const expanded = expandBLSSignature(deposit.signature, deposit.pubkey);
        return {
          pubkeyY: { a: expanded.pubkeyY_a, b: expanded.pubkeyY_b },
          signatureY: {
            c0_a: expanded.sigY_c0_a,
            c0_b: expanded.sigY_c0_b,
            c1_a: expanded.sigY_c1_a,
            c1_b: expanded.sigY_c1_b,
          },
        };
      });

      const confirm = await confirmOperation(
        `Are you sure you want to predeposit ${deposits.length} deposits to the vault ${vaultAddress}?
      Pubkeys: ${deposits.map((i) => i.pubkey).join(', ')}`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'predeposit',
        payload: [vaultAddress, deposits, depositsY],
      });
    },
  );

depositsWrite
  .command('proof-and-prove')
  .aliases(['prove'])
  .description('make proof and prove')
  .option('-i, --index <index>', 'validator index', stringToNumber)
  .action(async ({ index }: { index: number }) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const { proof, pubkey, childBlockTimestamp, slot, proposerIndex } =
      await makePDGProofByIndex(validatorIndex);

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'proveValidatorWC',
      payload: [
        {
          proof,
          pubkey,
          validatorIndex: BigInt(validatorIndex),
          childBlockTimestamp,
          slot,
          proposerIndex,
        },
      ],
    });
  });

depositsWrite
  .command('prove-and-deposit')
  .description('happy path shortcut for the node operator')
  .argument('<indexes>', 'validator indexes', stringToNumberArray)
  .argument('<deposits>', 'deposits', parseDepositArray)
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .addHelpText(
    'after',
    `Deposit format:
  '[{
    "pubkey": "...",
    "signature": "...",
    "amount": "...",
    "deposit_data_root": "..."
  }
  {second deposit}
  ...]'`,
  )
  .action(
    async (
      indexes: number[],
      deposits: Deposit[],
      { vault }: { vault: Address },
    ) => {
      const pdgContract = await getPredepositGuaranteeContract();

      const witnesses = await makePDGProofByIndexes(indexes);
      if (!witnesses) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveAndDeposit',
        payload: [witnesses, deposits, vault],
      });
    },
  );
