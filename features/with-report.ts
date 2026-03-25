import { Address } from 'viem';
import { checkIsReportFresh } from 'features/utils/report-fresh.js';
import { callWriteMethodWithCalls } from 'utils';

import {
  PartialContract,
  PopulatedTx,
  WriteTxArgs,
} from 'utils/transactions/types.js';

export const callWriteMethodsWithReportFresh = async <
  T extends PartialContract,
  M extends keyof T['write'] & string,
>(
  args: WriteTxArgs<T, M> & { calls?: PopulatedTx[]; vault: Address },
): Promise<void> => {
  const { vault, ...rest } = args;
  const isReportFresh = await checkIsReportFresh({ vault, populateTx: true });
  if (!isReportFresh.isFresh) return;

  const calls = [
    ...(isReportFresh.data ? [isReportFresh.data] : []),
    ...(rest.calls || []),
  ];

  await callWriteMethodWithCalls({
    ...rest,
    calls,
    silent: true,
  });
};
