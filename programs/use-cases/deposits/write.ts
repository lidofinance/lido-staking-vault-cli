import { formatEther, Hex, parseEther, type Address } from 'viem';
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
  etherToWeiArray,
  parseValidatorTopUpArray,
  stringToHex,
  callReadMethodSilent,
} from 'utils';
import {
  chooseVaultAndGetDashboard,
  makePDGProofByIndex,
  makePDGProofByIndexes,
  checkNOBalancePDGforDeposit,
  getAddress,
  checkNodeOperatorOrDepositorForDeposit,
  checkAndSpecifyNodeOperatorForTopUpOrWithdraw,
  getGuarantor,
  checkBLSWithAmountDeposits,
  VALIDATOR_STAGES,
  checkValidatorStageAndStagedBalanceForActivation,
  checkBLSDeposits,
  checkPdgIsPaused,
} from 'features';
import { Deposit, ValidatorTopUp } from 'types';
import {
  getPredepositGuaranteeContract,
  getStakingVaultContract,
} from 'contracts';

import { deposits } from './main.js';
import { getAccount } from 'providers';

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
    `Deposit format (amount are in gwei):
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
      const { vault: vaultAddress } = await chooseVaultAndGetDashboard({
        vault,
      });
      const pdgContract = await getPredepositGuaranteeContract();
      const vaultContract = await getStakingVaultContract(vaultAddress);

      const isPaused = await checkPdgIsPaused(pdgContract);
      if (isPaused) return;

      const nodeOperator = await checkNodeOperatorOrDepositorForDeposit(
        vaultContract,
        pdgContract,
      );

      if (blsCheck)
        await checkBLSWithAmountDeposits(pdgContract, vaultContract, deposits);

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
  .command('prove-and-activate')
  .aliases(['prove'])
  .description(
    'permissionless method to prove correct Withdrawal Credentials for the validator and to send the activation deposit',
  )
  .option('-i, --index <index>', 'validator index', stringToNumber)
  .action(async ({ index }: { index: number }) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const isPaused = await checkPdgIsPaused(pdgContract);
    if (isPaused) return;

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const { proof, pubkey, childBlockTimestamp, slot, proposerIndex } =
      await makePDGProofByIndex(validatorIndex);

    await checkValidatorStageAndStagedBalanceForActivation(pdgContract, pubkey);

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'proveWCAndActivate',
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
  .command('prove-and-top-up')
  .description(
    'prove validators to unlock NO balance, activate the validators from stash, and optionally top up NO balance',
  )
  .argument('<indexes>', 'validator indexes', stringToNumberArray)
  .argument(
    '<amounts>',
    'array of amounts (in ETH) to deposit to proven validator on top of ACTIVATION_DEPOSIT_AMOUNT',
    etherToWeiArray,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(
    async (
      indexes: number[],
      amounts: bigint[],
      { vault }: { vault: Address },
    ) => {
      const { vault: vaultAddress } = await chooseVaultAndGetDashboard({
        vault,
      });
      const pdgContract = await getPredepositGuaranteeContract();
      const vaultContract = await getStakingVaultContract(vaultAddress);

      const isPaused = await checkPdgIsPaused(pdgContract);
      if (isPaused) return;

      await checkNodeOperatorOrDepositorForDeposit(vaultContract, pdgContract);

      const witnesses = await makePDGProofByIndexes(indexes);
      if (!witnesses) return;

      await callWriteMethodWithReceipt({
        contract: pdgContract,
        methodName: 'proveWCActivateAndTopUpValidators',
        payload: [witnesses, amounts],
      });
    },
  );

depositsWrite
  .command('top-up-existing-validators')
  .aliases(['top-up-val'])
  .description('deposits ether to proven validators from staking vault.')
  .argument(
    '<topUps>',
    'array of ValidatorTopUp structs with pubkey and amounts',
    parseValidatorTopUpArray,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .addHelpText(
    'after',
    `ValidatorTopUp format (amount are in gwei):
  '[{
    "pubkey": "...",
    "amount": "...",
  }
  {second topUp}
  ...]'`,
  )
  .action(async (topUps: ValidatorTopUp[], { vault }: { vault: Address }) => {
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({ vault });
    const pdgContract = await getPredepositGuaranteeContract();
    const vaultContract = await getStakingVaultContract(vaultAddress);

    const isPaused = await checkPdgIsPaused(pdgContract);
    if (isPaused) return;

    await checkNodeOperatorOrDepositorForDeposit(vaultContract, pdgContract);

    const confirm = await confirmOperation(
      `Are you sure you want to top up ${topUps.length} validators with ${topUps.map((topUp) => formatEther(topUp.amount)).join(', ')} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'topUpExistingValidators',
      payload: [topUps],
    });
  });

depositsWrite
  .command('top-up-no')
  .description('top up Node Operator balance')
  .argument('<amount>', 'amount in ETH', etherToWei)
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .action(async (amount: bigint, { vault }: { vault: Address }) => {
    const pdgContract = await getPredepositGuaranteeContract();
    const { vault: vaultAddress } = await chooseVaultAndGetDashboard({
      vault,
      isNotMember: true,
    });
    const vaultContract = await getStakingVaultContract(vaultAddress);

    const isPaused = await checkPdgIsPaused(pdgContract);
    if (isPaused) return;

    const nodeOperator = await checkAndSpecifyNodeOperatorForTopUpOrWithdraw(
      vaultContract,
      pdgContract,
      true,
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
  });

depositsWrite
  .command('withdraw-no-balance')
  .description('withdraw Node Operator balance')
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
      const { vault: vaultAddress } = await chooseVaultAndGetDashboard({
        vault,
        isNotMember: true,
      });
      const vaultContract = await getStakingVaultContract(vaultAddress);

      const isPaused = await checkPdgIsPaused(pdgContract);
      if (isPaused) return;

      const nodeOperator = await checkAndSpecifyNodeOperatorForTopUpOrWithdraw(
        vaultContract,
        pdgContract,
        false,
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
  .description('set Node Operator guarantor')
  .action(async () => {
    const pdgContract = await getPredepositGuaranteeContract();

    const isPaused = await checkPdgIsPaused(pdgContract);
    if (isPaused) return;

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

depositsWrite
  .command('claim-guarantor-refund')
  .aliases(['claim-g-refund'])
  .description('claims refund for the previous guarantor of the NO')
  .option('-r, --recipient <string>', 'recipient address', stringToAddress)
  .action(async (recipient: Address) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const isPaused = await checkPdgIsPaused(pdgContract);
    if (isPaused) return;

    const recipientAddress = await getAddress(recipient, 'recipient');

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'claimGuarantorRefund',
      payload: [recipientAddress],
    });
  });

depositsWrite
  .command('activate-validator')
  .aliases(['activate'])
  .description(
    'permissionless method to activate the proven validator depositing 31 ETH from the staged balance of StakingVault',
  )
  .argument('<pubkey>', 'validator pubkey', stringToHex)
  .action(async (pubkey: Hex) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const isPaused = await checkPdgIsPaused(pdgContract);
    if (isPaused) return;

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
    if (validatorStage !== 'PROVEN') {
      throw new Error(
        `Validator is not in PROVEN stage (current: ${validatorStage}, ${stage})`,
      );
    }

    const confirm = await confirmOperation(
      `Are you sure you want to activate the validator ${pubkey} and deposit ${formatEther(ACTIVATION_DEPOSIT_AMOUNT)} ETH from the staged balance of StakingVault?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'activateValidator',
      payload: [pubkey],
    });
  });

depositsWrite
  .command('set-no-depositor')
  .alias('set-no-d')
  .description('sets the depositor for the NO')
  .option('-d, --depositor <string>', 'depositor address', stringToAddress)
  .action(async ({ depositor }: { depositor: Address }) => {
    const pdgContract = await getPredepositGuaranteeContract();

    const isPaused = await checkPdgIsPaused(pdgContract);
    if (isPaused) return;

    const account = await getAccount();

    const depositorAddress = await getAddress(depositor, 'depositor');
    if (!depositorAddress) return;

    const confirm = await confirmOperation(
      `Are you sure you want to set the node operator (${account.address}) depositor to ${depositorAddress}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract: pdgContract,
      methodName: 'setNodeOperatorDepositor',
      payload: [depositorAddress],
    });
  });

depositsWrite
  .command('unguaranteed-deposit-to-beacon-chain')
  .alias('unguaranteed-deposit')
  .description(
    'withdraws ether from vault and deposits directly to provided validators bypassing the default PDG process',
  )
  .argument(
    '<deposits>',
    'array of IStakingVault.Deposit structs containing deposit data',
    parseDepositArray,
  )
  .option('-v, --vault <string>', 'vault address', stringToAddress)
  .option('--no-bls-check', 'skip bls signature check')
  .addHelpText(
    'after',
    `Deposit format (amount are in gwei):
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
      const { vault: vaultAddress, contract } =
        await chooseVaultAndGetDashboard({
          vault,
        });
      const vaultContract = await getStakingVaultContract(vaultAddress);

      const confirm = await confirmOperation(
        `Are you sure you want to unguaranteed deposit ${deposits.length} deposits to the beacon chain in the staking vault ${vaultAddress}?
      Pubkeys: ${deposits.map((i) => i.pubkey).join(', ')}`,
      );
      if (!confirm) return;

      if (blsCheck) await checkBLSDeposits(vaultContract, deposits);

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'unguaranteedDepositToBeaconChain',
        payload: [deposits],
      });
    },
  );
