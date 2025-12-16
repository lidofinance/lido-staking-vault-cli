/**
 * Helper functions to capture and validate data from features functions
 * These functions use spies to intercept logResult/logTable calls
 */

import { vi } from 'vitest';

/**
 * Captures data passed to logResult or logTable during function execution
 */
const captureLogData = async <T>(
  fn: () => Promise<void>,
  logFunctionName: 'logResult' | 'logTable',
): Promise<T | null> => {
  let capturedData: T | null = null;

  // Spy on logResult or logTable
  const utilsModule = await import('utils');
  const logSpy = vi
    .spyOn(utilsModule, logFunctionName)
    .mockImplementation((data: any) => {
      if (data && data.data) {
        // Convert array of [key, value] pairs back to object
        const obj = {} as any;
        for (const [key, value] of data.data) {
          obj[key] = value;
        }
        capturedData = obj as T;
      }
    });

  try {
    await fn();
  } finally {
    logSpy.mockRestore();
  }

  return capturedData;
};

/**
 * Captures data passed to logResult during function execution
 */
export const captureLogResult = async <T>(
  fn: () => Promise<void>,
): Promise<T | null> => {
  return captureLogData<T>(fn, 'logResult');
};

/**
 * Captures data passed to logTable during function execution
 */
export const captureLogTable = async <T>(
  fn: () => Promise<void>,
): Promise<T | null> => {
  return captureLogData<T>(fn, 'logTable');
};

/**
 * Validates that an address is valid (20 bytes / 40 hex chars)
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validates that a bytes32 hash is valid (32 bytes / 64 hex chars)
 * Used for role hashes, keccak256 values, etc.
 */
export const isValidBytes32 = (hash: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

/**
 * Validates that a bigint value is non-negative
 */
export const isNonNegativeBigInt = (value: bigint): boolean => {
  return value >= 0n;
};
