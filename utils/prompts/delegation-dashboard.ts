import { Address } from 'viem';
import { confirmPrompt, textPrompt } from './default.js';

export const dashboardAddressPrompt = async () => {
  return await textPrompt('Enter dashboard address', 'address');
};

export const amountWeiPrompt = async () => {
  return await textPrompt('Enter amount in wei', 'amountWei');
};

export const confirmContractAndAmount = async (
  dashboard: Address,
  amountWei: string,
) => {
  return await confirmPrompt(
    `Do you want to fund the dashboard ${dashboard} with ${amountWei} wei?`,
    'confirm',
  );
};

export const confirmFund = async (address: Address, amountWei: string) => {
  let contractAddress: Address | null = address;
  let amount: string | null = amountWei;

  if (!contractAddress) {
    const answerDashboardAddress = await dashboardAddressPrompt();
    contractAddress = answerDashboardAddress.address as Address;
  }

  if (!amount) {
    const answerAmount = await amountWeiPrompt();
    amount = answerAmount.amountWei as string;
  }

  const { confirm } = await confirmContractAndAmount(contractAddress, amount);

  if (!confirm) {
    console.info('Command cancelled');
    return { address: null, amount: null };
  }

  return { address: contractAddress, amount: amount };
};
