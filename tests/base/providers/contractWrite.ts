import { PartialContract, WriteTxArgs } from '../utils';
import { Address } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { getChain } from '../config';
import { getClient } from './wallet';

export const callWriteMethod = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(
  args: WriteTxArgs<T, M>,
): Promise<{
  tx: Address;
  receipt: Awaited<ReturnType<typeof waitForTransactionReceipt>>;
}> => {
  const { account, contract, methodName, payload } = args;

  try {
    const method = contract.write[methodName];

    const tx = await method?.(payload, {
      account,
      chain: getChain(),
    });

    const receipt = await waitForTransactionReceipt(getClient(), {
      hash: tx,
      confirmations: 3,
    });

    return { receipt, tx };
  } catch (err) {
    throw new Error(
      `Error when calling write method ${methodName}@${contract.address}. Error: ${err}`,
    );
  }
};
