import { Hex, zeroHash } from 'viem';

export const DEFAULT_SALT = zeroHash;

// Helper function to process salt option
// Note: saltOption is already validated as Hex by Commander's stringToHash parser (SALT_OPTION)
export const processSalt = (saltOption?: Hex): Hex => {
  return (saltOption as Hex) ?? DEFAULT_SALT;
};
