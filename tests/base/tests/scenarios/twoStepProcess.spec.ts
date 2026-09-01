import { test } from '../test.fixture';
import { Address, formatEther, getAddress, parseEther } from 'viem';
import { getStandConfig } from '../../config';
import process from 'node:process';
import { getPermissionRole, ROLES } from '../../testData/roles.data';

import lsvCLI, { OperatorGridMock } from '../../utils';
import { expect } from '@playwright/test';
import { LIDO_CONNECTION_COLLATERAL, TierParams } from '../../testData/consts';
import { getBalanceEth, getClient } from '../../providers';
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

const CONFIRM_EXPIRY = 86400;
const NO_FEE_RATE = 100;

const noGroupLimit = parseEther('100');
const mintAmount = '10';

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

test.describe.serial('Two step process', () => {
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

  test('NO assign for individual tiers', async () => {
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

  test('NO creates vault disconnected from VaultHub without collateral', async ({
    ethereumNodeService,
  }) => {
    const noVaultCreatorAccount = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.NODE_OPERATOR).index,
    );
    const publicClient = getClient();
    const vaultCreatorBalanceBeforeCreate = await publicClient.getBalance({
      address: noVaultCreatorAccount.address as Address,
    });

    const vaultData =
      await test.step('Create vault disconnected from VaultHub without collateral', async () => {
        return await lsvCLI.factory.createVault({
          defaultAdmin: roles.defaultAdmin.address,
          nodeOperator: roles.nodeOperator.address,
          nodeOperatorManager: roles.nodeOperatorManager.address,
          confirmExpiry: CONFIRM_EXPIRY,
          nodeOperatorFeeRate: NO_FEE_RATE,
          privateKey: noVaultCreatorAccount.secretKey,
          connectedToVh: false,
        });
      });

    vaultAddress = vaultData.vaultAddress;
    dashboardAddress = vaultData.dashboardAddress;

    await test.step('Check vault created', async () => {
      await test.step('Check vault not connected to VaultHub', async () => {
        const cliIsVaultConnectedToVaultHub =
          await lsvCLI.hub.isVaultConnected(vaultAddress);
        const contractIsVaultConnectedToVaultHub =
          await isVaultConnected(vaultAddress);
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

      await test.step('Check that no collateral was set for disconnected vault', async () => {
        const receipt =
          (await publicClient
            .getTransactionReceipt({ hash: vaultData.txHash })
            .catch(() => undefined)) ||
          (await publicClient.waitForTransactionReceipt({
            hash: vaultData.txHash,
          }));
        const vaultCreatorBalanceAfterCreation = await publicClient.getBalance({
          address: noVaultCreatorAccount.address as Address,
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

        const expectedCollateralEth = '0';

        expect(
          vaultCreatorBalanceDifference,
          `Vault creation not requires collateral of ${LIDO_CONNECTION_COLLATERAL} ETH`,
        ).toBe(parseEther(expectedCollateralEth));
        expect(
          cliCollateralEth,
          `Vault creation not requires collateral of ${LIDO_CONNECTION_COLLATERAL} ETH`,
        ).toBe(expectedCollateralEth);

        expect(
          cliTotalValueEth,
          'CLI total value should be correct with contract for disconnected vault',
        ).toBe(contractTotalValueEth);
        expect(
          contractTotalValueEth,
          `Collateral become "Total value" of vault`,
        ).toBe(expectedCollateralEth);
      });
    });
  });

  test('Connect vault to VH with favorable stETH minting capacity', async ({
    ethereumNodeService,
  }) => {
    const cliVaultInfoBeforeChangeTier =
      await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);
    const cliNoGroupInfo = await lsvCLI.operatorGrid.getGroup(
      roles.nodeOperator.address,
    );
    const requestedTierShareLimit = formatEther(tierParams1.shareLimit);
    const tierIdToChange = cliNoGroupInfo.tierIds.find(
      (id) => id !== cliVaultInfoBeforeChangeTier.tierId,
    );
    if (tierIdToChange === undefined) {
      throw new Error('No tier ID found to change');
    }

    await test.step(`NO apply change tier for ${vaultAddress} vault`, async () => {
      const noPK = ethereumNodeService.getAccount(
        getPermissionRole(ROLES.NODE_OPERATOR).index,
      ).secretKey;
      await lsvCLI.operatorGrid.changeTier(
        vaultAddress,
        requestedTierShareLimit,
        tierIdToChange,
        noPK,
      );
    });

    await test.step(`VM accepts tier && supply 1 ETH as collateral for connection to VH`, async () => {
      const vmRolePK = ethereumNodeService.getAccount(
        getPermissionRole(ROLES.DEFAULT_ADMIN).index,
      ).secretKey;

      await lsvCLI.dashboard.connectAndAcceptTier(
        dashboardAddress,
        tierIdToChange,
        requestedTierShareLimit,
        vmRolePK,
      );

      const cliIsVaultConnectedToVaultHub =
        await lsvCLI.hub.isVaultConnected(vaultAddress);
      const contractIsVaultConnectedToVaultHub =
        await isVaultConnected(vaultAddress);
      const expectedVaultConnection = true;
      const {
        totalValueEth: cliTotalValueEth,
        collateralEth: cliCollateralEth,
      } = await lsvCLI.dashboard.overview(dashboardAddress);
      const contractTotalValueEth = formatEther(
        await getTotalValue(dashboardAddress),
      );

      await test.step(`Check vault connection to hub && collateral`, async () => {
        expect(
          cliIsVaultConnectedToVaultHub,
          'Check cli connection state correct with contract',
        ).toBe(contractIsVaultConnectedToVaultHub);
        expect(
          cliIsVaultConnectedToVaultHub,
          'Created vault should be connected to VaultHub',
        ).toBe(expectedVaultConnection);
        expect(
          cliTotalValueEth,
          'CLI total value should be correct with contract after connection',
        ).toBe(contractTotalValueEth);
        expect(
          cliTotalValueEth,
          `Collateral become "Total value" of vault after connection`,
        ).toBe(LIDO_CONNECTION_COLLATERAL);
        expect(
          cliCollateralEth,
          'Expect lido connection collateral to be applied',
        ).toBe(LIDO_CONNECTION_COLLATERAL);
      });

      await test.step(`Check tier applied`, async () => {
        const cliVaultInfo =
          await lsvCLI.operatorGrid.getVaultInfo(vaultAddress);

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
          cliVaultInfo.tierId,
          'CLI tier id should match selected tier id',
        ).toBe(tierIdToChange);
        expect(
          cliVaultInfo.tierId,
          'CLI tier id should match contract vaultTierInfo',
        ).toBe(Number(contractTierId));
        expect(
          cliVaultInfo.nodeOperator.toLowerCase(),
          'CLI node operator should match contract vaultTierInfo',
        ).toBe((contractNodeOperator as string).toLowerCase());
        expect(
          cliVaultInfo.shareLimit,
          'CLI share limit should match contract vaultTierInfo',
        ).toBe(contractShareLimit);
        expect(
          cliVaultInfo.reserveRatioBP,
          'CLI reserve ratio BP should match contract vaultTierInfo',
        ).toBe(contractReserveRatioBP);
        expect(
          cliVaultInfo.forcedRebalanceThresholdBP,
          'CLI forced rebalance threshold BP should match contract vaultTierInfo',
        ).toBe(contractForcedRebalanceThresholdBP);
        expect(
          cliVaultInfo.infraFeeBP,
          'CLI infra fee BP should match contract vaultTierInfo',
        ).toBe(contractInfraFeeBP);
        expect(
          cliVaultInfo.liquidityFeeBP,
          'CLI liquidity fee BP should match contract vaultTierInfo',
        ).toBe(contractLiquidityFeeBP);
        expect(
          cliVaultInfo.reservationFeeBP,
          'CLI reservation fee BP should match contract vaultTierInfo',
        ).toBe(contractReservationFeeBP);
      });
    });
  });

  test(`Supply vault as ${ROLES.DEFAULT_ADMIN}`, async ({
    ethereumNodeService,
  }) => {
    const vmRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.DEFAULT_ADMIN).index,
    ).secretKey;
    const {
      totalValueEth: cliTotalValueEthBeforeSupply,
      totalMintingCapacitySteth: cliTotalMintingCapacityStethBeforeSupply,
    } = await lsvCLI.dashboard.overview(dashboardAddress);

    const supplyAmount = '31';

    expect(
      cliTotalMintingCapacityStethBeforeSupply,
      `Restrict minting using collateral for newly connected vault`,
    ).toBe('0');

    await lsvCLI.vo.supply(vaultAddress, supplyAmount, vmRolePK);

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

  test(`Mint stETH as ${ROLES.DEFAULT_ADMIN}`, async ({
    ethereumNodeService,
  }) => {
    const vmRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.DEFAULT_ADMIN).index,
    ).secretKey;
    const vmAddress = getAddress(
      ethereumNodeService.getAccount(
        getPermissionRole(ROLES.DEFAULT_ADMIN).index,
      ).address,
    );
    const recipientStEthBalanceBeforeMint = await getStEthBalance(vmAddress);

    await lsvCLI.vo.mintStEth(vaultAddress, mintAmount, vmAddress, vmRolePK);

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
      await getStEthBalance(vmAddress),
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

  test(`Burn stETH as ${ROLES.DEFAULT_ADMIN}`, async ({
    ethereumNodeService,
  }) => {
    const vmRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.DEFAULT_ADMIN).index,
    ).secretKey;
    const vmAddress = getAddress(
      ethereumNodeService.getAccount(
        getPermissionRole(ROLES.DEFAULT_ADMIN).index,
      ).address,
    );

    const recipientStEthBalanceBeforeRepay = await getStEthBalance(vmAddress);

    const { liabilitySteth: cliLiabilityStEthBeforeRepay } =
      await lsvCLI.dashboard.overview(dashboardAddress);

    await lsvCLI.vo.burnStEth(
      vaultAddress,
      cliLiabilityStEthBeforeRepay,
      vmRolePK,
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
      await getStEthBalance(vmAddress),
    );

    expect(
      recipientStEthBalanceAfterRepay,
      'Expect recipient stEth address reduces correct amount after burn',
    ).toBe(calculatedRecipientStEthBalanceAfterRepay);
  });

  test(`Withdraw ETH as ${ROLES.DEFAULT_ADMIN}`, async ({
    ethereumNodeService,
  }) => {
    const vmRolePK = ethereumNodeService.getAccount(
      getPermissionRole(ROLES.DEFAULT_ADMIN).index,
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
      vmRolePK,
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
