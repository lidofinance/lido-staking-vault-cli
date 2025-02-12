import { isAddress } from 'viem';

import { JSONConfig } from 'types';

export const validateConfig = (config: JSONConfig) => {
  const errors = {} as Record<keyof JSONConfig, string>;

  if (!isValidUrl(config.rpcLink)) {
    errors.rpcLink = 'Invalid rpcLink: must be a valid URL.';
  }

  if (typeof config.privateKey !== 'string' || !config.privateKey) {
    errors.privateKey = 'Invalid privateKey: must be a non-empty string.';
  }

  if (typeof config.chainId !== 'number' || isNaN(config.chainId)) {
    errors.chainId = 'Invalid chainId: must be a string representing a number.';
  }

  if (
    typeof config.lidoLocator !== 'string' ||
    !isAddress(config.lidoLocator)
  ) {
    errors.lidoLocator =
      'Invalid lidoLocator: must be a valid Ethereum address.';
  }

  if (typeof config.accounting !== 'string' || !isAddress(config.accounting)) {
    errors.accounting = 'Invalid accounting: must be a valid Ethereum address.';
  }

  return errors;
};

export const isValidUrl = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  if ('canParse' in URL) {
    return URL.canParse(value);
  }

  try {
    // used global here to avid types issue
    new global.URL(value);
    return true;
  } catch {
    return false;
  }
};

export const validateAddressMap = (payload: Record<any, any>) => {
  return Object.keys(payload).reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!isAddress(payload[key]!)) {
      acc.push(`${key} is not a valid address`);
    }

    return acc;
  }, [] as string[]);
};
