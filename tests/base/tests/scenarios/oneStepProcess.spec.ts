import { getStandConfig } from '../../config';
import { test } from '../test.fixture';
import {
  buildAdditionalRoles,
  getPermissionRole,
  NO_ROLES,
  PERMISSION_ROLES,
  ROLES,
} from '../../testData/roles.data';
import lsvCLI, { OperatorGridMock } from '../../utils';
import { Address, formatEther, parseEther } from 'viem';
import {
  DEFAULT_TIER_ID,
  DEFAULT_TIER_PARAMS,
  LIDO_CONNECTION_COLLATERAL,
  TierParams,
} from '../../testData/consts';
import { expect } from '@playwright/test';
import {
  getLiabilityShares,
  getTotalMintingCapacityShares,
  getPooledEthBySharesRoundUp,
} from '../../contracts';

const CONFIRM_EXPIRY = 86400;
const NO_FEE_RATE = 100;

const noGroupLimit = parseEther('1000');

const tierParams1: TierParams = {
  shareLimit: noGroupLimit / 2n,
  reserveRatioBP: BigInt('2000'),
  forcedRebalanceThresholdBP: BigInt('1800'),
  infraFeeBP: BigInt('500'),
  liquidityFeeBP: BigInt('400'),
  reservationFeeBP: BigInt('100'),
};

const tierParams2: TierParams = {
  shareLimit: noGroupLimit / 2n,
  reserveRatioBP: BigInt('2000'),
  forcedRebalanceThresholdBP: BigInt('1800'),
  infraFeeBP: BigInt('500'),
  liquidityFeeBP: BigInt('400'),
  reservationFeeBP: BigInt('100'),
};

test.describe.serial.only('One step process', () => {
  let vaultAddress: Address;
  let dashboardAddress: Address;
  let nodeUrl: string;
  let roles: any;
  const mintAmount = '10';

  test.beforeAll(async ({ ethereumNodeService, defaultVaultData }) => {
    await test.step('Setup env for CLI', async () => {
      if (ethereumNodeService.state) {
        nodeUrl = ethereumNodeService.state.nodeUrl;
        process.env.DEPLOYED = `../../../configs/${getStandConfig().deployed}`;
        process.env.EL_URL = nodeUrl;
      } else throw new Error('EthereumNodeService node ready');
    });

    roles = defaultVaultData.roles;
  });

  test('Create vault connected to vault hub && configure with all roles ', async ({
    ethereumNodeService,
  }) => {
    const vaultData =
      await test.step('Create vault connected to VaultHub && grant all VM roles', async () => {
        const additionalRoles = buildAdditionalRoles(ethereumNodeService);
        const vaultCreatorPK = ethereumNodeService.getAccount(
          getPermissionRole(ROLES.DEFAULT_ADMIN).index,
        ).secretKey;

        return await lsvCLI.factory.createVaultConnectedToVh({
          defaultAdmin: roles.defaultAdmin.address,
          nodeOperator: roles.nodeOperator.address,
          nodeOperatorManager: roles.nodeOperatorManager.address,
          confirmExpiry: CONFIRM_EXPIRY,
          nodeOperatorFeeRate: NO_FEE_RATE,
          roles: additionalRoles,
          privateKey: vaultCreatorPK,
        });
      });

    vaultAddress = vaultData.vaultAddress;
    dashboardAddress = vaultData.dashboardAddress;

    await test.step('Check vault created', async () => {
      await test.step('Check vault connected to VaultHub', async () => {
        const isVaultConnectedToVaultHub =
          await lsvCLI.hub.isVaultConnected(vaultAddress);
        const expectedVaultConnection = true;

        expect(
          isVaultConnectedToVaultHub,
          'Created vault should be connected to VaultHub',
        ).toBe(expectedVaultConnection);
      });

      await test.step('Check vault metrics', async () => {
        const { totalValueEth, collateralEth } =
          await lsvCLI.dashboard.overview(dashboardAddress);

        expect(
          collateralEth,
          `Vault creation requires collateral of ${LIDO_CONNECTION_COLLATERAL} ETH`,
        ).toBe(LIDO_CONNECTION_COLLATERAL);

        expect(totalValueEth, `Collateral become "Total value" of vault`).toBe(
          LIDO_CONNECTION_COLLATERAL,
        );
      });

      await test.step(`Check vault connected with default tier has correct params - {${DEFAULT_TIER_ID}}`, async () => {
        const vaultInfoBeforeChangeTier =
          await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);

        await test.step(`Check defaultTier ${vaultInfoBeforeChangeTier.tierId} params`, async () => {
          expect(
            vaultInfoBeforeChangeTier.tierId,
            `Vault tier in default tier params should be ${DEFAULT_TIER_ID}`,
          ).toBe(DEFAULT_TIER_ID);
          expect(
            vaultInfoBeforeChangeTier.shareLimit,
            `Vault shareLimit in default tier params should be ${DEFAULT_TIER_PARAMS.shareLimit}`,
          ).toBe(DEFAULT_TIER_PARAMS.shareLimit);
          expect(
            vaultInfoBeforeChangeTier.reserveRatioBP,
            `Vault reserveRatioBP in default tier params should be ${DEFAULT_TIER_PARAMS.reserveRatioBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.reserveRatioBP);
          expect(
            vaultInfoBeforeChangeTier.forcedRebalanceThresholdBP,
            `Vault forcedRebalanceThresholdBP in default tier params should be ${DEFAULT_TIER_PARAMS.forcedRebalanceThresholdBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.forcedRebalanceThresholdBP);
          expect(
            vaultInfoBeforeChangeTier.infraFeeBP,
            `Vault infraFeeBP in default tier params should be ${DEFAULT_TIER_PARAMS.infraFeeBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.infraFeeBP);
          expect(
            vaultInfoBeforeChangeTier.liquidityFeeBP,
            `Vault liquidityFeeBP in default tier params should be ${DEFAULT_TIER_PARAMS.liquidityFeeBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.liquidityFeeBP);
          expect(
            vaultInfoBeforeChangeTier.reservationFeeBP,
            `Vault reservationFeeBP in default tier params should be ${DEFAULT_TIER_PARAMS.reservationFeeBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.reservationFeeBP);
        });
      });
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

  test('Adjust stETH minting parameters', async ({ ethereumNodeService }) => {
    await test.step(`${ROLES.NODE_OPERATOR} applied for new tier`, async () => {
      const operatorGridMock = new OperatorGridMock();

      await test.step('Register tiers for NO', async () => {
        await operatorGridMock.registerGroup(
          roles.nodeOperator.address,
          noGroupLimit,
        );
      });

      await test.step('Register tiers for NO', async () => {
        await operatorGridMock.registerTier(roles.nodeOperator.address, [
          tierParams1,
          tierParams2,
        ]);
      });
    });

    await test.step(`Change tier via multi-role confirmation as ${ROLES.NODE_OPERATOR} && ${ROLES.DEFAULT_ADMIN}`, async () => {
      const vaultInfoBeforeChangeTier =
        await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);
      const noGroupInfo = await lsvCLI.operatorGrid.getGroup(
        roles.nodeOperator.address,
      );
      const tierIdToChange = noGroupInfo.tierIds.find(
        (id) => id !== vaultInfoBeforeChangeTier.tierId,
      );
      if (tierIdToChange === undefined) {
        throw new Error('No tier ID found to change');
      }

      await test.step(`Change tier as ${ROLES.DEFAULT_ADMIN}`, async () => {
        const vmPK = ethereumNodeService.getAccount(
          getPermissionRole(ROLES.DEFAULT_ADMIN).index,
        ).secretKey;

        await lsvCLI.vo.changeTierAsVM(
          vaultAddress,
          formatEther(tierParams1.shareLimit),
          tierIdToChange,
          vmPK,
        );
      });

      await test.step(`Change tier as ${ROLES.NODE_OPERATOR}`, async () => {
        const noPK = ethereumNodeService.getAccount(
          getPermissionRole(ROLES.NODE_OPERATOR).index,
        ).secretKey;

        await lsvCLI.vo.changeTierByNO(
          vaultAddress,
          formatEther(tierParams1.shareLimit),
          tierIdToChange,
          noPK,
        );
      });

      await test.step('Check tier change correct', async () => {
        const vaultInfoAfterChangeTier =
          await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);
        expect(
          vaultInfoAfterChangeTier.tierId,
          `Tier should be updated to ${vaultInfoAfterChangeTier.tierId}`,
        ).toBe(tierIdToChange);
        //extend assertions with updated tier params
      });
    });
  });

  test(`Supply vault as ${ROLES.FUND}`, async ({ ethereumNodeService }) => {
    const supplyRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.FUND).index,
    ).secretKey;
    const {
      totalValueEth: totalValueBeforeSupply,
      totalMintingCapacitySteth: totalMintingCapacityStethBeforeSupply,
    } = await lsvCLI.dashboard.overview(dashboardAddress);

    const supplyAmount = '31';

    expect(
      totalMintingCapacityStethBeforeSupply,
      `Restrict minting using collateral for newly created vault`,
    ).toBe('0');

    await lsvCLI.vo.supply(vaultAddress, supplyAmount, supplyRolePK);

    const expectedTotalValueEthAfterSupply = String(
      parseFloat(supplyAmount) + parseFloat(totalValueBeforeSupply),
    );
    const expectedMintingCapacityAfterSupply = formatEther(
      await getTotalMintingCapacityShares(dashboardAddress),
    );
    const { totalValueEth, totalMintingCapacityShares } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    expect(totalValueEth, 'Check "Total value ETH" to be correct').toBe(
      expectedTotalValueEthAfterSupply,
    );
    expect(
      totalMintingCapacityShares,
      'Additional supply on top of Lido connection collateral updates "TotalMintingCapacity"',
    ).toBe(expectedMintingCapacityAfterSupply);
  });

  test(`Mint stETH as ${ROLES.MINT}`, async ({ ethereumNodeService }) => {
    const mintRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.MINT).index,
    ).secretKey;
    const recipientRepaRoleAddress = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.BURN).index,
    ).address;

    await lsvCLI.vo.mintStEth(
      vaultAddress,
      mintAmount,
      recipientRepaRoleAddress as Address,
      mintRolePK,
    );

    const {
      liabilityShares: dashboardLiabilityShares,
      liabilitySteth: dashboardLiabilityStEth,
    } = await lsvCLI.dashboard.overview(dashboardAddress);
    const liabilityShares = await getLiabilityShares(dashboardAddress);
    const contractLiabilityStEth =
      await getPooledEthBySharesRoundUp(liabilityShares);

    expect(
      dashboardLiabilityShares,
      'Expect dashboard liability shares to be correct with contract after mint',
    ).toBe(formatEther(liabilityShares));
    expect(
      dashboardLiabilityStEth,
      'Expect dashboard liability stETH to be correct with contract',
    ).toBe(contractLiabilityStEth);
  });

  test(`Burn stETH as ${ROLES.BURN}`, async ({ ethereumNodeService }) => {
    const repayRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.BURN).index,
    ).secretKey;

    // Full repay
    const { liabilitySteth: liabilityStEthBeforeRepay } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    await lsvCLI.vo.burnStEth(
      vaultAddress,
      liabilityStEthBeforeRepay,
      repayRolePK,
    );

    const { liabilitySteth: dashboardLiabilityStEth } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    const contractLiabilityShares = await getLiabilityShares(dashboardAddress);
    const contractLiabilityStEth = await getPooledEthBySharesRoundUp(
      contractLiabilityShares,
    );

    expect(
      dashboardLiabilityStEth,
      'Expect dashboard liability to be correct with contract after burn',
    ).toBe(contractLiabilityStEth);
    expect(dashboardLiabilityStEth).toBe('0');
  });
});
