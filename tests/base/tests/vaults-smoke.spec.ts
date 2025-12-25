import { expect } from '@playwright/test';
import { getStandConfig } from '../config';
import { test } from './test.fixture';
import {
  buildAdditionalRoles,
  getPermissionRole,
  NO_ROLES,
  PERMISSION_ROLES,
  ROLES,
} from '../testData/roles.data';
import lsvCLI from '../utils/lsvCLI';
import { Address, formatEther } from 'viem';
import { getTotalValue, isVaultConnected } from '../contracts';
import process from 'node:process';
import { LIDO_CONNECTION_COLLATERAL } from '../testData/consts';

const CONFIRM_EXPIRY = 86400;
const NO_FEE_RATE = 100;

test.describe.serial.only('Vault smoke test', () => {
  let vaultAddress: Address;
  let dashboardAddress: Address;
  let nodeUrl: string;
  let roles: any;

  test.beforeAll(async ({ ethereumNodeService, defaultVaultData }) => {
    await test.step('Setup env for CLI', async () => {
      const standConfig = getStandConfig();
      if (ethereumNodeService.state) {
        nodeUrl = ethereumNodeService.state.nodeUrl;
        process.env.DEPLOYED = `../../../configs/${standConfig.deployed}`;
        process.env.CHAIN_ID = standConfig.networkConfig.chainId.toString();
        process.env.EL_URL = nodeUrl;
      } else throw new Error('EthereumNodeService node ready');
    });

    roles = defaultVaultData.roles;
  });

  test('Create vault and supply', async ({ ethereumNodeService }) => {
    const vaultCreatorAccount = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.DEFAULT_ADMIN).index,
    );

    await test.step('Create vault connected to VaultHub && grant all VM roles', async () => {
      const additionalRoles = buildAdditionalRoles(ethereumNodeService);

      const vaultData = await lsvCLI.factory.createVault({
        defaultAdmin: roles.defaultAdmin.address,
        nodeOperator: roles.nodeOperator.address,
        nodeOperatorManager: roles.nodeOperatorManager.address,
        confirmExpiry: CONFIRM_EXPIRY,
        nodeOperatorFeeRate: NO_FEE_RATE,
        roles: additionalRoles,
        privateKey: vaultCreatorAccount.secretKey,
        connectedToVh: true,
      });

      vaultAddress = vaultData.vaultAddress;
      dashboardAddress = vaultData.dashboardAddress;

      await test.step('Check vault connected to VaultHub', async () => {
        const cliIsVaultConnectedToVaultHub =
          await lsvCLI.hub.isVaultConnected(vaultAddress);
        const contractIsVaultConnectedToVaultHub =
          await isVaultConnected(vaultAddress);
        const expectedVaultConnection = true;

        expect(
          cliIsVaultConnectedToVaultHub,
          'Check cli connection state correct with contract',
        ).toBe(contractIsVaultConnectedToVaultHub);
        expect(
          cliIsVaultConnectedToVaultHub,
          'Created vault should be connected to VaultHub',
        ).toBe(expectedVaultConnection);
      });

      await test.step('Grant NOM related roles', async () => {
        const nomRolePK = ethereumNodeService.getAccount(
          getPermissionRole(ROLES.NODE_OPERATOR_MANAGER).index,
        ).secretKey;

        await lsvCLI.dashboard.grantRole(
          vaultData.dashboardAddress,
          Array.from(PERMISSION_ROLES.entries())
            .filter(([role]) => NO_ROLES.includes(role))
            .map(([, { index, keccak }]) => ({
              account: ethereumNodeService.getAccount(index).address,
              role: keccak,
            })),
          nomRolePK,
        );
      });
    });

    await test.step(`Supply vault as ${ROLES.FUND}`, async () => {
      const supplyRolePK = ethereumNodeService.getAccount(
        getPermissionRole(ROLES.FUND).index,
      ).secretKey;
      const supplyAmount = '31';

      await lsvCLI.vo.supply(vaultAddress, supplyAmount, supplyRolePK);

      const contractTotalValueEthAfterSupply = formatEther(
        await getTotalValue(dashboardAddress),
      );
      const expectedTotalValueEthAfterSupply = String(
        parseFloat(supplyAmount) + parseFloat(LIDO_CONNECTION_COLLATERAL),
      );

      expect(
        contractTotalValueEthAfterSupply,
        `Total value after supply should be ${supplyAmount} + ${LIDO_CONNECTION_COLLATERAL} = ${expectedTotalValueEthAfterSupply}`,
      ).toBe(expectedTotalValueEthAfterSupply);
    });
  });

  test('Create vault without connecting to VaultHub', async ({
    ethereumNodeService,
  }) => {
    const vmAccount = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.DEFAULT_ADMIN).index,
    );

    await test.step('Create vault disconnected from VaultHub', async () => {
      const vaultData = await lsvCLI.factory.createVault({
        defaultAdmin: roles.defaultAdmin.address,
        nodeOperator: roles.nodeOperator.address,
        nodeOperatorManager: roles.nodeOperatorManager.address,
        confirmExpiry: CONFIRM_EXPIRY,
        nodeOperatorFeeRate: NO_FEE_RATE,
        privateKey: vmAccount.secretKey,
        connectedToVh: false,
      });

      await test.step('Check vault not connected to VaultHub', async () => {
        const cliIsVaultConnectedToVaultHub = await lsvCLI.hub.isVaultConnected(
          vaultData.vaultAddress,
        );
        const contractIsVaultConnectedToVaultHub = await isVaultConnected(
          vaultData.vaultAddress,
        );
        const expectedVaultConnection = false;

        expect(
          cliIsVaultConnectedToVaultHub,
          'Check cli connection state correct with contract',
        ).toBe(contractIsVaultConnectedToVaultHub);
        expect(
          cliIsVaultConnectedToVaultHub,
          'Created vault should be not connected to VaultHub',
        ).toBe(expectedVaultConnection);
      });
    });
  });
});
