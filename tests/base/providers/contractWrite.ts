import { PartialContract, WriteTxArgs } from '../utils';
import { Address } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { getChain } from '../config';
import { getClient } from './clients';

const MAX_RETRIES = process.env.CI ? 5 : 3;
const RETRY_DELAY_MS = process.env.CI ? 3000 : 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isTimeoutError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  return (
    errorMessage.includes('timeout') ||
    errorMessage.includes('took too long') ||
    errorMessage.includes('aborted')
  );
};

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

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
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
    } catch (err: any) {
      lastError = err;

      if (isTimeoutError(err) && attempt < MAX_RETRIES) {
        console.warn(
          `Timeout when calling ${methodName}@${contract.address}, attempt ${attempt}/${MAX_RETRIES}. Retrying in ${RETRY_DELAY_MS}ms...`,
        );
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      throw new Error(
        `Error when calling write method ${methodName}@${contract.address}. Error: ${err}`,
      );
    }
  }

  throw new Error(
    `Error when calling write method ${methodName}@${contract.address} after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`,
  );
};
