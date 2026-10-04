import { test } from './test.fixture';
import { getPermissionRole, ROLES } from '../testData/roles.data';
import lsvCLI from '../utils';
import { Address } from 'viem';

const ROLES_TO_CHECK = [ROLES.DEFAULT_ADMIN, ROLES.FUND];
const supplyAmount = '1';

ROLES_TO_CHECK.forEach((role) => {
  test.skip(`Supply Vault as ${role}`, async ({
    ethereumNodeService,
    defaultVaultData,
  }) => {
    const supplyRolePK = ethereumNodeService.getAccount(
      getPermissionRole(role).index,
    ).secretKey;

    await lsvCLI.vo.supply(
      defaultVaultData.dashboardAddress as Address,
      supplyAmount,
      supplyRolePK,
    );
  });
});
export {};
