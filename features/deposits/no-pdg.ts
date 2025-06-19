import { Address, formatEther } from 'viem';

import { PredepositGuaranteeContract, StakingVaultContract } from 'contracts';
import {
  callReadMethodSilent,
  confirmOperation,
  logInfo,
  numberPrompt,
  addressPrompt,
} from 'utils';
import { getAccount } from 'providers';

export const checkNOBalancePDGforDeposit = async (
  pdgContract: PredepositGuaranteeContract,
  nodeOperator: Address,
) => {
  const balance = await callReadMethodSilent(
    pdgContract,
    'nodeOperatorBalance',
    [nodeOperator],
  );
  const unlockedBalance = await callReadMethodSilent(
    pdgContract,
    'unlockedBalance',
    [nodeOperator],
  );
  let amountToTopUp = 0n;
  let isNeedTopUp = false;

  if (balance.total === 0n || unlockedBalance === 0n) {
    logInfo(
      `Node operator ${nodeOperator} has no unlocked balance in PDG to deposit`,
    );

    const isTopUp = await confirmOperation(
      `Do you want to top up NO balance in PDG?`,
    );
    if (!isTopUp)
      throw new Error(
        'A top-up is required for predeposit if the unlocked balance is 0',
      );

    const amount = await numberPrompt(
      'Enter amount to top up (in ETH). Value should multiply of 1 ETH (PREDEPOSIT_AMOUNT)',
      'value',
    );
    if (!amount) throw new Error('Amount is required');

    amountToTopUp = BigInt(amount.value);
    isNeedTopUp = true;
  }

  return { balance, unlockedBalance, amountToTopUp, isNeedTopUp };
};

export const checkNOBalancePDGforDeposits = async (
  pdgContract: PredepositGuaranteeContract,
  nodeOperator: Address,
  countOfDeposits: number,
) => {
  const PREDEPOSIT_AMOUNT = await callReadMethodSilent(
    pdgContract,
    'PREDEPOSIT_AMOUNT',
  );
  const unlockedBalance = await callReadMethodSilent(
    pdgContract,
    'unlockedBalance',
    [nodeOperator],
  );

  const amountToTopUp = PREDEPOSIT_AMOUNT * BigInt(countOfDeposits);

  const isNeedTopUp = unlockedBalance < amountToTopUp;

  if (isNeedTopUp) {
    const isTopUp = await confirmOperation(
      `Do you want to top up NO balance in PDG? Need to top up ${formatEther(amountToTopUp)} ETH (PREDEPOSIT_AMOUNT * countOfDeposits)`,
    );
    if (!isTopUp) throw new Error('A top-up is required for predeposit');
  }

  return { amountToTopUp, isNeedTopUp };
};

export const checkNodeOperatorForDeposit = async (
  vault: StakingVaultContract,
) => {
  const currentAccount = getAccount();
  const vaultNodeOperator = await callReadMethodSilent(vault, 'nodeOperator');

  if (
    vaultNodeOperator.toLocaleLowerCase() !==
    currentAccount.address.toLocaleLowerCase()
  ) {
    throw new Error(
      `You are not the node operator of the vault ${vault.address}. Only node operator can deposit from the vault.`,
    );
  }

  return vaultNodeOperator;
};

export const checkAndSpecifyNodeOperatorForTopUp = async (
  vault: StakingVaultContract,
  pdg: PredepositGuaranteeContract,
) => {
  const currentAccount = getAccount();
  const vaultNodeOperator = await callReadMethodSilent(vault, 'nodeOperator');
  const noGuarantor = await callReadMethodSilent(pdg, 'nodeOperatorGuarantor', [
    vaultNodeOperator,
  ]);

  const isNoGuarantor =
    noGuarantor.toLocaleLowerCase() ===
    currentAccount.address.toLocaleLowerCase();
  const isNodeOperator =
    vaultNodeOperator.toLocaleLowerCase() ===
    currentAccount.address.toLocaleLowerCase();

  if (!isNoGuarantor && !isNodeOperator) {
    throw new Error(
      `You are not the node operator of the vault ${vault.address} or not the guarantor of the node operator.`,
    );
  }

  if (!isNodeOperator && isNoGuarantor) {
    logInfo(
      `You are not the node operator of the vault ${vault.address}. You are the guarantor of the node operator ${vaultNodeOperator}.`,
    );

    const confirm = await confirmOperation(
      `Do you want to top up or withdraw the node operator ${vaultNodeOperator} balance?`,
    );
    if (!confirm) throw new Error('Top up or withdraw is not confirmed');

    return vaultNodeOperator;
  }

  return vaultNodeOperator;
};

export const getGuarantor = async (
  pdgContract: PredepositGuaranteeContract,
) => {
  const currentAccount = getAccount();
  const balance = await callReadMethodSilent(
    pdgContract,
    'nodeOperatorBalance',
    [currentAccount.address],
  );

  if (balance.locked > 0n) {
    throw new Error(
      `You have locked balance in PDG. You can't change the guarantor.`,
    );
  }

  if (balance.total > 0n) {
    logInfo(
      `You have balance in PDG. If you change the guarantor, your balance will be refunded to the previous guarantor 
      or guarantor can withdraw it before you change the guarantor.`,
    );

    const confirm = await confirmOperation(
      `Do you want to change the guarantor?`,
    );
    if (!confirm) throw new Error('Change the guarantor is not confirmed');
  }

  const newGuarantor = await addressPrompt(
    'Enter new guarantor address',
    'value',
  );
  if (!newGuarantor) throw new Error('New guarantor address is required');

  return {
    newGuarantor: newGuarantor.value,
    currentAccount: currentAccount.address,
  };
};
