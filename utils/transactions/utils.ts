import { Abi, decodeErrorResult, isHex, SimulateCallsReturnType } from 'viem';
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
      if (typeof data === 'string' && isHex(data)) {
        // data is a hex string, decode it
        const { errorName, args } = decodeErrorResult({
          abi: abi ?? DashboardAbi,
          data: data,
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

export const isWcSendCallsFailure = (error: unknown) => {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode =
    error != null && typeof error === 'object' && 'code' in error
      ? (error as { code: unknown }).code
      : undefined;

  return (
    errMsg.includes('wallet_sendCalls') ||
    errMsg.includes('isValidRequest') ||
    errMsg.includes('EIP-7702') ||
    errCode === 5750 // MetaMask error code for EIP-7702
  );
};
