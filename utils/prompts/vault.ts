import { RoleAssignment, VaultWithDashboard } from 'types';
import { confirmOperation } from './operations.js';

export const confirmCreateVaultParams = async (
  payload: VaultWithDashboard,
  otherRoles: RoleAssignment[],
) => {
  return await confirmOperation(
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
  );
};
