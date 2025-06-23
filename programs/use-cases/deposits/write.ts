import { formatEther, parseEther, type Address } from 'viem';
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
  etherToWei,
} from 'utils';
import {
  chooseVaultAndGetDashboard,
  checkBLSDeposits,
  makePDGProofByIndex,
  makePDGProofByIndexes,
  checkNOBalancePDGforDeposit,
  getAddress,
  checkNodeOperatorForDeposit,
  checkAndSpecifyNodeOperatorForTopUp,
  getGuarantor,
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

      const nodeOperator = await checkNodeOperatorForDeposit(vaultContract);

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

      const { amountToTopUp, isNeedTopUp } = await checkNOBalancePDGforDeposit(
        pdgContract,
        nodeOperator,
      );

      const confirm = await confirmOperation(
        `Are you sure you want to predeposit ${deposits.length} deposits to the vault ${vaultAddress}?
      Pubkeys: ${deposits.map((i) => i.pubkey).join(', ')}`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'predeposit',
        payload: [vaultAddress, deposits, depositsY],
        value: isNeedTopUp ? parseEther(String(amountToTopUp)) : undefined,
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
      const { vault: vaultAddress } = await chooseVaultAndGetDashboard(vault);
      const pdgContract = await getPredepositGuaranteeContract();
      const vaultContract = getStakingVaultContract(vaultAddress);

      await checkNodeOperatorForDeposit(vaultContract);

      const witnesses = await makePDGProofByIndexes(indexes);
      if (!witnesses) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveAndDeposit',
        payload: [witnesses, deposits, vaultAddress],
      });
    },
  );

depositsWrite
  .command('deposit-to-beacon-chain')
  .description('deposits ether to proven validators from staking vault')
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
  .action(async (deposits: Deposit[], { vault }: { vault: Address }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard(vault);
    const pdgContract = await getPredepositGuaranteeContract();
    const vaultContract = getStakingVaultContract(vaultAddress);

    await checkNodeOperatorForDeposit(vaultContract);

    const confirm = await confirmOperation(
      `Are you sure you want to deposit ${deposits.length} deposits to the vault ${vaultAddress}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'depositToBeaconChain',
      payload: [vaultAddress, deposits],
    });
  });

depositsWrite
  .command('top-up')
  .description('top up no balance')
  .argument('<amount>', 'amount in ETH', etherToWei)
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async ({ amount }: { amount: bigint }, { vault }: { vault: Address }) => {
      const pdgContract = await getPredepositGuaranteeContract();
      const { vault: vaultAddress } = await chooseVaultAndGetDashboard(vault);
      const vaultContract = getStakingVaultContract(vaultAddress);

      const nodeOperator = await checkAndSpecifyNodeOperatorForTopUp(
        vaultContract,
        pdgContract,
      );

      const confirm = await confirmOperation(
        `Are you sure you want to top up the node operator ${nodeOperator} with ${formatEther(amount)} ETH?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'topUpNodeOperatorBalance',
        payload: [nodeOperator],
        value: amount,
      });
    },
  );

depositsWrite
  .command('withdraw-no-balance')
  .description('withdraw node operator balance')
  .argument('<amount>', 'amount in ETH', etherToWei)
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .option(
    '-r, --recipient <string>',
    'address of the recipient',
    stringToAddress,
  )
  .action(
    async (
      amount: bigint,
      { vault, recipient }: { vault: Address; recipient: Address },
    ) => {
      const pdgContract = await getPredepositGuaranteeContract();
      const { vault: vaultAddress } = await chooseVaultAndGetDashboard(vault);
      const vaultContract = getStakingVaultContract(vaultAddress);

      const nodeOperator = await checkAndSpecifyNodeOperatorForTopUp(
        vaultContract,
        pdgContract,
      );
      const recipientAddress = await getAddress(recipient, 'recipient');

      const confirm = await confirmOperation(
        `Are you sure you want to withdraw the node operator ${nodeOperator} balance ${formatEther(amount)} ETH to ${recipientAddress}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'withdrawNodeOperatorBalance',
        payload: [nodeOperator, amount, recipientAddress],
      });
    },
  );

depositsWrite
  .command('set-no-guarantor')
  .aliases(['set-no-g'])
  .description('set node operator guarantor')
  .action(async () => {
    const pdgContract = await getPredepositGuaranteeContract();

    const { newGuarantor, currentAccount } = await getGuarantor(pdgContract);

    const confirm = await confirmOperation(
      `Are you sure you want to set the node operator (${currentAccount}) guarantor to ${newGuarantor}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'setNodeOperatorGuarantor',
      payload: [newGuarantor],
    });
  });
