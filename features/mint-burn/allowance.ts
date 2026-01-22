import { formatEther, Hex, TransactionReceipt } from 'viem';

import {
  getStethContract,
  DashboardContract,
  getWstethContract,
} from 'contracts';
import { getAccount } from 'providers';
import {
  callReadMethodSilent,
  callWriteMethodWithReceipt,
  confirmOperation,
  logInfo,
  PopulatedTx,
} from 'utils';

export const checkAllowance = async (
  contract: DashboardContract,
  amount: bigint,
  token: 'steth' | 'wsteth' | 'shares',
  populateTx?: boolean,
): Promise<{
  receipt?: TransactionReceipt;
  tx?: Hex;
  data?: PopulatedTx;
} | void> => {
  const accountAddress = (await getAccount()).address;
  const isShares = token === 'shares';
  let currentAmount = amount;

  if (token === 'steth' || isShares) {
    const stethContract = await getStethContract();

    const allowance = await callReadMethodSilent({
      contract: stethContract,
      methodName: 'allowance',
      payload: [[accountAddress, contract.address]],
    });
    if (isShares) {
      currentAmount = await callReadMethodSilent({
        contract: stethContract,
        methodName: 'getPooledEthByShares',
        payload: [[amount]],
      });
    }

    if (allowance < currentAmount) {
      logInfo('Insufficient allowance');

      const confirm = await confirmOperation(
        `Do you want to set allowance for ${formatEther(amount)} ${token} (${formatEther(currentAmount)} stETH) to ${contract.address} (Dashboard contract)? Current allowance: ${formatEther(allowance)} stETH`,
      );
      if (!confirm) throw new Error('Allowance not set');

      return await callWriteMethodWithReceipt({
        contract: stethContract,
        methodName: 'approve',
        payload: [contract.address, currentAmount],
        populateTx,
      });
    }
  } else {
    const wstethContract = await getWstethContract();

    const wstethAllowance = await callReadMethodSilent({
      contract: wstethContract,
      methodName: 'allowance',
      payload: [[accountAddress, contract.address]],
    });
    if (wstethAllowance < amount) {
      logInfo('Insufficient allowance');

      const confirm = await confirmOperation(
        `Do you want to set allowance for ${formatEther(amount)} ${token} to ${contract.address} (Dashboard contract)? Current allowance: ${formatEther(wstethAllowance)} wstETH`,
      );
      if (!confirm) throw new Error('Allowance not set');

      return await callWriteMethodWithReceipt({
        contract: wstethContract,
        methodName: 'approve',
        payload: [contract.address, amount],
        populateTx,
      });
    }
  }
};
