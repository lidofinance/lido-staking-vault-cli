import { Address } from 'viem';
import { program } from 'command';

import { logCancel } from 'utils';

import { textPrompt, confirmPrompt } from './default.js';

export const enterContractAddress = async (name = 'contract') => {
  const contract = await textPrompt(`Enter ${name} address`, 'address');

  return contract.address as Address;
};

export const confirmContractAndAmount = async (
  contract: Address,
  amountETH: string,
) => {
  const opts = program.opts();
  if (opts.yes) return true;

  const { confirm } = await confirmPrompt(
    `Do you want to fund the contract ${contract} with ${amountETH} ETH?`,
    'confirm',
  );

  if (!confirm) {
    logCancel('Command cancelled');
    return false;
  }

  return true;
};

export const enterAmountETH = async () => {
  return await textPrompt('Enter amount in ETH', 'amountETH');
};

export const confirmFund = async (
  address: Address,
  amountETH: string,
  name: string,
) => {
  let contractAddress: Address | null = address;
  let amount: string | null = amountETH;

  if (!contractAddress) {
    contractAddress = await enterContractAddress(name);

    if (!contractAddress) program.error('Command cancelled', { exitCode: 1 });
  }

  if (!amount) {
    const answerAmount = await enterAmountETH();
    amount = answerAmount.amountETH as string;

    if (!amount) program.error('Command cancelled', { exitCode: 1 });
  }

  const confirm = await confirmContractAndAmount(contractAddress, amount);
  if (!confirm) program.error('Command cancelled', { exitCode: 1 });

  return { address: contractAddress, amount: amount };
};

export const confirmOperation = async (message: string) => {
  const opts = program.opts();
  if (opts.yes) return true;

  const { confirm } = await confirmPrompt(message, 'confirm');

  if (!confirm) {
    logCancel('Command cancelled');
    return false;
  }

  return true;
};
