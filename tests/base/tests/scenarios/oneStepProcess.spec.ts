import { expect } from '@playwright/test';
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
import { Address, formatEther, getAddress, parseEther } from 'viem';
import {
  DEFAULT_TIER_ID,
  DEFAULT_TIER_PARAMS,
  LIDO_CONNECTION_COLLATERAL,
  TierParams,
} from '../../testData/consts';
import {
  getLiabilityShares,
  getTotalValue,
  getTotalMintingCapacityShares,
  getPooledEthBySharesRoundUp,
  getWithdrawValue,
  getStEthBalance,
  isVaultConnected,
} from '../../contracts';
import { getVaultTierInfo } from '../../contracts/operatorGrid';
import process from 'node:process';
import { getBalanceEth, getClient } from '../../providers';

const CONFIRM_EXPIRY = 86400;
const NO_FEE_RATE = 100;

const noGroupLimit = parseEther('100');

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

test.describe.serial('One step process', () => {
  let vaultAddress: Address;
  let dashboardAddress: Address;
  let nodeUrl: string;
  let roles: any;
  const mintAmount = '10';

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

  test('Create vault connected to vault hub && configure with all roles ', async ({
    ethereumNodeService,
  }) => {
    const vaultCreatorAccount = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.DEFAULT_ADMIN).index,
    );
    const publicClient = getClient();
    const vaultCreatorBalanceBeforeCreate = await publicClient.getBalance({
      address: vaultCreatorAccount.address as Address,
    });

    const vaultData =
      await test.step('Create vault connected to VaultHub && grant all VM roles', async () => {
        const additionalRoles = buildAdditionalRoles(ethereumNodeService);

        return await lsvCLI.factory.createVault({
          defaultAdmin: roles.defaultAdmin.address,
          nodeOperator: roles.nodeOperator.address,
          nodeOperatorManager: roles.nodeOperatorManager.address,
          confirmExpiry: CONFIRM_EXPIRY,
          nodeOperatorFeeRate: NO_FEE_RATE,
          roles: additionalRoles,
          privateKey: vaultCreatorAccount.secretKey,
          connectedToVh: true,
        });
      });

    vaultAddress = vaultData.vaultAddress;
    dashboardAddress = vaultData.dashboardAddress;

    await test.step('Check vault created', async () => {
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

      await test.step('Check collateral', async () => {
        const receipt =
          (await publicClient
            .getTransactionReceipt({ hash: vaultData.txHash })
            .catch(() => undefined)) ||
          (await publicClient.waitForTransactionReceipt({
            hash: vaultData.txHash,
          }));
        const vaultCreatorBalanceAfterCreation = await publicClient.getBalance({
          address: vaultCreatorAccount.address as Address,
        });
        const txFee = receipt.gasUsed * receipt.effectiveGasPrice;
        const vaultCreatorBalanceDifference =
          vaultCreatorBalanceBeforeCreate -
          vaultCreatorBalanceAfterCreation -
          txFee;
        const {
          totalValueEth: cliTotalValueEth,
          collateralEth: cliCollateralEth,
        } = await lsvCLI.dashboard.overview(dashboardAddress);
        const contractTotalValueEth = formatEther(
          await getTotalValue(dashboardAddress),
        );

        expect(
          vaultCreatorBalanceDifference,
          `Vault creation requires collateral of ${LIDO_CONNECTION_COLLATERAL} ETH`,
        ).toBe(parseEther(LIDO_CONNECTION_COLLATERAL));
        expect(
          cliCollateralEth,
          `Vault creation requires collateral of ${LIDO_CONNECTION_COLLATERAL} ETH`,
        ).toBe(LIDO_CONNECTION_COLLATERAL);

        expect(
          cliTotalValueEth,
          'CLI total value should be correct with contract after creation',
        ).toBe(contractTotalValueEth);
        expect(
          contractTotalValueEth,
          `Collateral become "Total value" of vault`,
        ).toBe(LIDO_CONNECTION_COLLATERAL);
      });

      await test.step(`Check vault connected with default tier has correct params - {${DEFAULT_TIER_ID}}`, async () => {
        const cliVaultInfoBeforeChangeTier =
          await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);

        // get DefaultTier params from contracts
        await test.step(`Check defaultTier ${cliVaultInfoBeforeChangeTier.tierId} params`, async () => {
          expect(
            cliVaultInfoBeforeChangeTier.tierId,
            `Vault tier in default tier params should be ${DEFAULT_TIER_ID}`,
          ).toBe(DEFAULT_TIER_ID);
          expect(
            cliVaultInfoBeforeChangeTier.shareLimit,
            `Vault shareLimit in default tier params should be ${DEFAULT_TIER_PARAMS.shareLimit}`,
          ).toBe(DEFAULT_TIER_PARAMS.shareLimit);
          expect(
            cliVaultInfoBeforeChangeTier.reserveRatioBP,
            `Vault reserveRatioBP in default tier params should be ${DEFAULT_TIER_PARAMS.reserveRatioBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.reserveRatioBP);
          expect(
            cliVaultInfoBeforeChangeTier.forcedRebalanceThresholdBP,
            `Vault forcedRebalanceThresholdBP in default tier params should be ${DEFAULT_TIER_PARAMS.forcedRebalanceThresholdBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.forcedRebalanceThresholdBP);
          expect(
            cliVaultInfoBeforeChangeTier.infraFeeBP,
            `Vault infraFeeBP in default tier params should be ${DEFAULT_TIER_PARAMS.infraFeeBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.infraFeeBP);
          expect(
            cliVaultInfoBeforeChangeTier.liquidityFeeBP,
            `Vault liquidityFeeBP in default tier params should be ${DEFAULT_TIER_PARAMS.liquidityFeeBP}`,
          ).toBe(DEFAULT_TIER_PARAMS.liquidityFeeBP);
          expect(
            cliVaultInfoBeforeChangeTier.reservationFeeBP,
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
      const cliVaultInfoBeforeChangeTier =
        await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);
      const cliNoGroupInfo = await lsvCLI.operatorGrid.getGroup(
        roles.nodeOperator.address,
      );
      const tierIdToChange = cliNoGroupInfo.tierIds.find(
        (id) => id !== cliVaultInfoBeforeChangeTier.tierId,
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
        const cliVaultInfoAfterChangeTier =
          await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);
        expect(
          cliVaultInfoAfterChangeTier.tierId,
          `Tier should be updated to ${cliVaultInfoAfterChangeTier.tierId}`,
        ).toBe(tierIdToChange);

        const [
          contractNodeOperator,
          contractTierId,
          contractShareLimit,
          contractReserveRatioBP,
          contractForcedRebalanceThresholdBP,
          contractInfraFeeBP,
          contractLiquidityFeeBP,
          contractReservationFeeBP,
        ] = await getVaultTierInfo(vaultAddress);

        expect(
          cliVaultInfoAfterChangeTier.tierId,
          'CLI tier id should match contract vaultTierInfo',
        ).toBe(Number(contractTierId));

        expect(
          cliVaultInfoAfterChangeTier.nodeOperator.toLowerCase(),
          'CLI node operator should match contract vaultTierInfo',
        ).toBe((contractNodeOperator as string).toLowerCase());

        expect(
          cliVaultInfoAfterChangeTier.shareLimit,
          'CLI share limit should match contract vaultTierInfo',
        ).toBe(contractShareLimit);

        expect(
          cliVaultInfoAfterChangeTier.reserveRatioBP,
          'CLI reserve ratio BP should match contract vaultTierInfo',
        ).toBe(contractReserveRatioBP);

        expect(
          cliVaultInfoAfterChangeTier.forcedRebalanceThresholdBP,
          'CLI forced rebalance threshold BP should match contract vaultTierInfo',
        ).toBe(contractForcedRebalanceThresholdBP);

        expect(
          cliVaultInfoAfterChangeTier.infraFeeBP,
          'CLI infra fee BP should match contract vaultTierInfo',
        ).toBe(contractInfraFeeBP);

        expect(
          cliVaultInfoAfterChangeTier.liquidityFeeBP,
          'CLI liquidity fee BP should match contract vaultTierInfo',
        ).toBe(contractLiquidityFeeBP);

        expect(
          cliVaultInfoAfterChangeTier.reservationFeeBP,
          'CLI reservation fee BP should match contract vaultTierInfo',
        ).toBe(contractReservationFeeBP);
      });
    });
  });

  test(`Supply vault as ${ROLES.FUND}`, async ({ ethereumNodeService }) => {
    const supplyRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.FUND).index,
    ).secretKey;
    const {
      totalValueEth: cliTotalValueEthBeforeSupply,
      totalMintingCapacitySteth: cliTotalMintingCapacityStethBeforeSupply,
    } = await lsvCLI.dashboard.overview(dashboardAddress);

    const supplyAmount = '31';

    expect(
      cliTotalMintingCapacityStethBeforeSupply,
      `Restrict minting using collateral for newly created vault`,
    ).toBe('0');

    await lsvCLI.vo.supply(vaultAddress, supplyAmount, supplyRolePK);

    const expectedTotalValueEthAfterSupply = String(
      parseFloat(supplyAmount) + parseFloat(cliTotalValueEthBeforeSupply),
    );
    const expectedTotalMintingCapacitySharesAfterSupply = formatEther(
      await getTotalMintingCapacityShares(dashboardAddress),
    );
    const {
      totalValueEth: cliTotalValueEthAfterSupply,
      totalMintingCapacityShares: cliTotalMintingCapacitySharesAfterSupply,
    } = await lsvCLI.dashboard.overview(dashboardAddress);
    const contractTotalValueEthAfterSupply = formatEther(
      await getTotalValue(dashboardAddress),
    );

    expect(
      cliTotalValueEthAfterSupply,
      'CLI total value ETH after supply should be calculated correctly',
    ).toBe(expectedTotalValueEthAfterSupply);
    expect(
      cliTotalValueEthAfterSupply,
      'CLI total value ETH after supply should match contract total value',
    ).toBe(contractTotalValueEthAfterSupply);
    expect(
      cliTotalMintingCapacitySharesAfterSupply,
      'Additional supply on top of Lido connection collateral updates "TotalMintingCapacity"',
    ).toBe(expectedTotalMintingCapacitySharesAfterSupply);
  });

  test(`Mint stETH as ${ROLES.MINT}`, async ({ ethereumNodeService }) => {
    const mintRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.MINT).index,
    ).secretKey;
    const recipientRepayRoleAddress = getAddress(
      ethereumNodeService.getAccount(getPermissionRole(ROLES.BURN).index)
        .address,
    );
    const recipientStEthBalanceBeforeMint = await getStEthBalance(
      recipientRepayRoleAddress,
    );

    await lsvCLI.vo.mintStEth(
      vaultAddress,
      mintAmount,
      recipientRepayRoleAddress,
      mintRolePK,
    );

    const {
      liabilityShares: cliLiabilitySharesAfterMint,
      liabilitySteth: cliLiabilityStEthAfterMint,
    } = await lsvCLI.dashboard.overview(dashboardAddress);
    const contractLiabilityShares = await getLiabilityShares(dashboardAddress);
    const contractLiabilityStEth = await getPooledEthBySharesRoundUp(
      contractLiabilityShares,
    );
    const calculatedRecipientStEthBalanceAfterMint =
      parseFloat(recipientStEthBalanceBeforeMint) + parseFloat(mintAmount);
    const recipientStEthBalanceAfterMint = parseFloat(
      await getStEthBalance(recipientRepayRoleAddress),
    );

    expect(
      cliLiabilitySharesAfterMint,
      'Expect dashboard liability shares to be correct with contract after mint',
    ).toBe(formatEther(contractLiabilityShares));
    expect(
      cliLiabilityStEthAfterMint,
      'Expect dashboard liability stETH to be correct with contract',
    ).toBe(contractLiabilityStEth);
    expect(
      recipientStEthBalanceAfterMint,
      'Expect recipient stEth address receives correct amount',
    ).toBe(calculatedRecipientStEthBalanceAfterMint);
  });

  test(`Burn stETH as ${ROLES.BURN}`, async ({ ethereumNodeService }) => {
    const repayRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.BURN).index,
    ).secretKey;
    const repayRoleAddress = getAddress(
      ethereumNodeService.getAccount(getPermissionRole(ROLES.BURN).index)
        .address,
    );

    const recipientStEthBalanceBeforeRepay =
      await getStEthBalance(repayRoleAddress);

    // Full repay
    const { liabilitySteth: cliLiabilityStEthBeforeRepay } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    await lsvCLI.vo.burnStEth(
      vaultAddress,
      cliLiabilityStEthBeforeRepay,
      repayRolePK,
    );

    const { liabilitySteth: cliLiabilityStEthAfterRepay } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    const contractLiabilityShares = await getLiabilityShares(dashboardAddress);
    const contractLiabilityStEth = await getPooledEthBySharesRoundUp(
      contractLiabilityShares,
    );

    expect(
      cliLiabilityStEthAfterRepay,
      'Expect dashboard liability to be correct with contract after burn',
    ).toBe(contractLiabilityStEth);
    expect(cliLiabilityStEthAfterRepay).toBe('0');

    const calculatedRecipientStEthBalanceAfterRepay =
      parseFloat(recipientStEthBalanceBeforeRepay) -
      parseFloat(cliLiabilityStEthBeforeRepay);
    const recipientStEthBalanceAfterRepay = parseFloat(
      await getStEthBalance(repayRoleAddress),
    );

    expect(
      recipientStEthBalanceAfterRepay,
      'Expect recipient stEth address reduces correct amount after burn',
    ).toBe(calculatedRecipientStEthBalanceAfterRepay);
  });

  test(`Withdraw ETH as ${ROLES.WITHDRAW}`, async ({ ethereumNodeService }) => {
    const withdrawRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.WITHDRAW).index,
    ).secretKey;
    const withdrawRecipientAddress = getAddress(
      ethereumNodeService.getAccount(getPermissionRole(ROLES.STRANGER).index)
        .address,
    );

    const withdrawRecipientBalanceBeforeWithdraw = await getBalanceEth(
      withdrawRecipientAddress,
    );

    // Full withdraw
    const { availableToWithdrawalEth: cliAvailableToWithdrawalEthBefore } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    await lsvCLI.vo.withdraw(
      vaultAddress,
      cliAvailableToWithdrawalEthBefore,
      withdrawRecipientAddress,
      withdrawRolePK,
    );

    const { availableToWithdrawalEth: cliAvailableToWithdrawalEthAfter } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    const withdrawRecipientBalanceAfterWithdraw = parseFloat(
      await getBalanceEth(withdrawRecipientAddress),
    );
    const calculatedWithdrawRecipientBalanceAfter =
      parseFloat(withdrawRecipientBalanceBeforeWithdraw) +
      parseFloat(cliAvailableToWithdrawalEthBefore);

    const contractWithdrawableValueEth = formatEther(
      await getWithdrawValue(dashboardAddress),
    );

    expect(
      contractWithdrawableValueEth,
      'Expect dashboard available to withdraw to be correct with contract',
    ).toBe(cliAvailableToWithdrawalEthAfter);
    expect(cliAvailableToWithdrawalEthAfter).toBe('0');
    expect(
      withdrawRecipientBalanceAfterWithdraw,
      'Expect recipient resieve withdrawable eth',
    ).toBe(calculatedWithdrawRecipientBalanceAfter);
  });
});
