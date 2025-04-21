import { RoleAssignment, VaultWithDashboard } from 'types';
import { confirmPrompt } from './default.js';

export const confirmCreateVaultParams = async (
  payload: VaultWithDashboard,
  otherRoles: RoleAssignment[],
) => {
  return await confirmPrompt(
    `Do you want to create a vault with the following parameters?
    ${JSON.stringify(
      payload,
      (_key, value) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value;
      },
      2,
    )}
    ${JSON.stringify(
      otherRoles,
      (_key, value) => {
        return value;
      },
      2,
    )}`,
    'confirm',
  );
};
