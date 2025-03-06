import { Address } from 'viem';
import { confirmPrompt, textPrompt } from './default.js';

export const dashboardAddressPrompt = async () => {
  return await textPrompt('Enter dashboard address', 'address');
};

export const amountWeiPrompt = async () => {
  return await textPrompt('Enter amount in wei', 'amountWei');
};

export const confirmDashboardAndAmount = async (
  dashboard: Address,
  amountWei: string,
) => {
  return await confirmPrompt(
    `Do you want to fund the dashboard ${dashboard} with ${amountWei} wei?`,
    'confirm',
  );
};

export const confirmFund = async (dashboard: Address, amountWei: string) => {
  let dashboardAddress: Address | null = dashboard;
  let amount: string | null = amountWei;

  if (!dashboardAddress) {
    const answerDashboardAddress = await dashboardAddressPrompt();
    dashboardAddress = answerDashboardAddress.address as Address;
  }

  if (!amount) {
    const answerAmount = await amountWeiPrompt();
    amount = answerAmount.amountWei as string;
  }

  const { confirm } = await confirmDashboardAndAmount(dashboardAddress, amount);

  if (!confirm) {
    console.info('Command cancelled');
    return { dashboard: null, amountWei: null };
  }

  return { dashboard: dashboardAddress, amount: amount };
};
