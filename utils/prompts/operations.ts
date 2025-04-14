import { Address } from 'viem';
import { program } from 'commander';

import { textPrompt, confirmPrompt } from './default.js';

export const enterContractAddress = async (name = 'contract') => {
  return await textPrompt(`Enter ${name} address`, 'address');
};

export const confirmContractAndAmount = async (
  contract: Address,
  amountWei: string,
) => {
  return await confirmPrompt(
    `Do you want to fund the contract ${contract} with ${amountWei} wei?`,
    'confirm',
  );
};

export const enterAmountWei = async () => {
  return await textPrompt('Enter amount in wei', 'amountWei');
};

export const confirmFund = async (
  address: Address,
  amountWei: string,
  name: string,
) => {
  let contractAddress: Address | null = address;
  let amount: string | null = amountWei;

  if (!contractAddress) {
    const answerAddress = await enterContractAddress(name);
    contractAddress = answerAddress.address as Address;

    if (!contractAddress) program.error('Command cancelled', { exitCode: 1 });
  }

  if (!amount) {
    const answerAmount = await enterAmountWei();
    amount = answerAmount.amountWei as string;

    if (!amount) program.error('Command cancelled', { exitCode: 1 });
  }

  const { confirm } = await confirmContractAndAmount(contractAddress, amount);
  if (!confirm) program.error('Command cancelled', { exitCode: 1 });

  return { address: contractAddress, amount: amount };
};
