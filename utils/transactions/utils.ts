import { Abi, decodeErrorResult, Hex, SimulateCallsReturnType } from 'viem';
import { DashboardAbi } from 'abi';
import { printError } from 'utils';

import { PopulatedTx } from './types.js';

export const simulateCallsErrorHandler = (
  simulate: SimulateCallsReturnType<PopulatedTx[]>,
  abi?: Abi,
) => {
  const errors = simulate.results.filter((r) => r.status !== 'success');

  for (const item of errors) {
    const error = item.error;
    const cause = error?.cause as any;

    const data = cause?.data || cause?.raw || item.data;

    if (data) {
      // Check if data is already decoded (object) or needs decoding (hex string)
      if (typeof data === 'string' && data.startsWith('0x')) {
        // data is a hex string, decode it
        const { errorName, args } = decodeErrorResult({
          abi: abi ?? DashboardAbi,
          data: data as Hex,
        });

        const errorArgs = args?.map((a) => a?.toString() ?? '') ?? [];
        const errorMessage = `${errorName}: ${errorArgs.join(', ')}`;
        printError(new Error(errorMessage), 'Simulation failed');
      } else if (typeof data === 'object' && data.errorName) {
        // data is already decoded, use it directly
        const errorArgs = data.args?.map((a: any) => a?.toString() ?? '') ?? [];
        const errorMessage = `${data.errorName}: ${errorArgs.join(', ')}`;
        printError(new Error(errorMessage), 'Simulation failed');
      }
    }

    const shortMessage = cause?.shortMessage;
    printError(error, shortMessage);
  }
};
