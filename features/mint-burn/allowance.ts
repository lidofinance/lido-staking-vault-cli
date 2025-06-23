import { formatEther } from 'viem';

import {
  getStethContract,
  DashboardContract,
  getWstethContract,
} from 'contracts';
import { getAccount } from 'providers';
import {
  callReadMethod,
  callReadMethodSilent,
  callWriteMethodWithReceipt,
  confirmOperation,
  logInfo,
} from 'utils';
export const checkAllowance = async (
  contract: DashboardContract,
  amount: bigint,
  token: 'steth' | 'wsteth' | 'shares',
) => {
  const accountAddress = getAccount().address;
  const isShares = token === 'shares';
  let currentAmount = amount;

  if (token === 'steth' || isShares) {
    const stethContract = await getStethContract();

    const allowance = await callReadMethod(stethContract, 'allowance', [
      accountAddress,
      contract.address,
    ]);
    if (isShares) {
      currentAmount = await callReadMethodSilent(
        stethContract,
        'getPooledEthBySharesRoundUp',
        [amount],
      );
    }

    if (allowance < currentAmount) {
      logInfo('Insufficient allowance');

      const confirm = await confirmOperation(
        `Do you want to set allowance for ${formatEther(amount)} ${token} (${formatEther(currentAmount)} stETH) to ${contract.address} (Dashboard contract)? Current allowance: ${formatEther(allowance)} stETH`,
      );
      if (!confirm) throw new Error('Allowance not set');

      await callWriteMethodWithReceipt({
        contract: stethContract,
        methodName: 'approve',
        payload: [contract.address, currentAmount],
      });
    }
  } else {
    const wstethContract = await getWstethContract();

    const wstethAllowance = await callReadMethod(wstethContract, 'allowance', [
      accountAddress,
      accountAddress,
    ]);
    if (wstethAllowance < amount) {
      logInfo('Insufficient allowance');

      const confirm = await confirmOperation(
        `Do you want to set allowance for ${formatEther(amount)} ${token} to ${contract.address} (Dashboard contract)? Current allowance: ${formatEther(wstethAllowance)} wstETH`,
      );
      if (!confirm) throw new Error('Allowance not set');

      await callWriteMethodWithReceipt({
        contract: wstethContract,
        methodName: 'approve',
        payload: [contract.address, amount],
      });
    }
  }
};
