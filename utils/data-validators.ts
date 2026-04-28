import { isAddress } from 'viem';

import type { Config, RoleAssignment } from 'types';

export const validateConfig = (config: Config) => {
  const errors = {} as Record<keyof Config, string>;

  if (Number.isNaN(config.CHAIN_ID)) {
    errors.CHAIN_ID = 'Invalid chainId: must be in config.';
  }

  return errors;
};

export const ALLOWED_HTTP_SCHEMES = new Set(['http:', 'https:']);

export const assertSafeUrl = (url: string, label: string): void => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label}: invalid URL: ${url}`);
  }
  if (!ALLOWED_HTTP_SCHEMES.has(parsed.protocol)) {
    throw new Error(
      `${label}: unsupported URL scheme "${parsed.protocol}" (only http/https allowed)`,
    );
  }
};

export const transformAddressesToArray = (payload: RoleAssignment[]) => {
  return payload.reduce(
    (acc, role) => {
      if (!acc[role.role]) {
        acc[role.role] = [role.account];
        return acc;
      }

      acc[role.role]?.push(role.account);
      return acc;
    },
    {} as Record<string, string[]>,
  );
};

export const validateAddressesMap = (payload: Record<any, any>) => {
  return Object.keys(payload).reduce((acc, key) => {
    for (const item of payload[key] as string[]) {
      if (!isAddress(item)) {
        acc.push(`${key}: ${item} is not a valid address`);
      }
    }

    return acc;
  }, [] as string[]);
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
