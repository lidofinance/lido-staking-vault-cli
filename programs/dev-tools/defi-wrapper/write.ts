import {
  Address,
  encodeAbiParameters,
  keccak256,
  parseEther,
  formatEther,
  parseUnits,
  formatUnits,
} from 'viem';
import { logInfo, callReadMethodSilent, stringToBigInt } from 'utils';

import { getTestClient } from 'providers';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/index.js';

import { defiWrapperTools } from './main.js';

const STORAGE_LOCATION =
  '0x9eb73ffa4c77d08d5d1746cf5a5e50a47018b610ea5d728ea9bd9e399b76e200';

defiWrapperTools
  .command('change-storage')
  .description(
    'Make user position unhealthy by manipulating VaultHub storage (for testing in Fork)',
  )
  .argument('<address>', 'wrapper address')
  .argument(
    '<user>',
    'user address to make unhealthy. For checking user position and previewForceRebalance',
  )
  .option(
    '-v, --value <number>',
    'value to set in VaultHub storage (Report.totalValue) in ETH. Default is 1.7',
    '1.7',
  )
  .option(
    '-s, --storage-location <string>',
    'VaultHub storage location for VaultRecord',
    STORAGE_LOCATION,
  )
  .action(
    async (
      address: Address,
      user: Address,
      options: {
        storageLocation: string;
        value: string;
      },
    ) => {
      const { storageLocation, value } = options;

      const publicClient = await getTestClient();
      const contract = await getStvStethPoolContract(address);

      const poolForcedRebalanceThresholdBP = await callReadMethodSilent(
        contract,
        'poolForcedRebalanceThresholdBP',
      );

      logInfo('\n=== Wrapper Configuration ===');
      logInfo(
        `Pool forced rebalance threshold: ${poolForcedRebalanceThresholdBP} BP (${Number(poolForcedRebalanceThresholdBP) / 100}%)`,
      );

      const [vault, vaultHub] = await Promise.all([
        callReadMethodSilent(contract, 'VAULT'),
        callReadMethodSilent(contract, 'VAULT_HUB'),
      ]);

      const vaultSlot = keccak256(
        encodeAbiParameters(
          [{ type: 'address' }, { type: 'uint256' }],
          [vault, stringToBigInt(storageLocation)],
        ),
      );

      logInfo('\n=== User Position BEFORE ===');

      const [totalAssetsBefore, userForceRebalanceBefore] = await Promise.all([
        callReadMethodSilent(contract, 'totalAssets'),
        callReadMethodSilent(contract, 'previewForceRebalance', [user]),
      ]);

      const [
        _stethSharesBefore,
        _stvAmountBefore,
        isUndercollateralizedBefore,
      ] = userForceRebalanceBefore;

      logInfo(`Total wrapper assets: ${formatEther(totalAssetsBefore)}`);
      logInfo(`User needs force rebalance: ${isUndercollateralizedBefore}`);

      logInfo('\n=== Manipulating VaultHub Storage ===');

      // Modifying slot 0 (report.totalValue) in VaultHub
      const reportSlot = vaultSlot;
      const reportValue = await publicClient.getStorageAt({
        address: vaultHub,
        slot: reportSlot,
      });

      if (!reportValue) {
        throw new Error('Failed to read report storage');
      }

      // Structure: first 20 bytes - other fields, last 12 bytes - totalValue
      const reportHex = reportValue.slice(2);
      const reportPart1 = reportHex.slice(0, 40);
      const reportTotalValue = reportHex.slice(40, 64);

      const reportTotalValueDecimal = BigInt('0x' + reportTotalValue);
      const newReportTotalValue = parseEther(value);

      logInfo(
        `Reducing report.totalValue: ${formatEther(reportTotalValueDecimal)} → ${value}`,
      );

      const newReportTotalValueHex = newReportTotalValue
        .toString(16)
        .padStart(24, '0');
      const newReportValue = `0x${reportPart1}${newReportTotalValueHex}`;

      await publicClient.request({
        method: 'anvil_setStorageAt',
        params: [vaultHub, reportSlot, newReportValue] as any,
      });

      logInfo('\n=== User Position AFTER ===');

      const [totalAssetsAfter, userForceRebalanceAfter, previewRedeemResult] =
        await Promise.all([
          callReadMethodSilent(contract, 'totalAssets'),
          callReadMethodSilent(contract, 'previewForceRebalance', [user]),
          callReadMethodSilent(contract, 'previewRedeem', [
            parseUnits('1', 27),
          ]),
        ]);

      const [stethShares, stvAmount, isUndercollateralizedAfter] =
        userForceRebalanceAfter;

      logInfo(
        `Total wrapper assets: ${formatEther(totalAssetsAfter)} (was ${formatEther(totalAssetsBefore)})`,
      );
      logInfo(`User needs force rebalance: ${isUndercollateralizedAfter}`);

      if (isUndercollateralizedAfter) {
        logInfo(`  ↳ stETH shares to burn: ${formatEther(stethShares)}`);
        logInfo(`  ↳ STV amount to burn: ${formatUnits(stvAmount, 27)}`);
      }

      logInfo(`Preview redeem (1 STV): ${formatEther(previewRedeemResult)}`);

      logInfo('\n✅ Storage manipulation completed successfully!');
    },
  );
