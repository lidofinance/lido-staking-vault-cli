import { isAddress } from 'viem';

import { Config, RoleAssignment } from 'types';

export const validateConfig = (config: Config) => {
  const errors = {} as Record<keyof Config, string>;

  if (isNaN(config.CHAIN_ID)) {
    errors.CHAIN_ID = 'Invalid chainId: must be in config.';
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
    payload[key].forEach((item: string) => {
      if (!isAddress(item)) {
        acc.push(`${key}: ${item} is not a valid address`);
      }
    });

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
