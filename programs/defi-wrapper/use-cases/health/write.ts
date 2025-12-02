import { type Address, formatEther, formatUnits } from 'viem';
import { health } from './main.js';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/index.js';
import { getStethContract } from 'contracts/index.js';
import {
  stringToAddress,
  logInfo,
  logTable,
  callReadMethodSilent,
  callWriteMethodWithReceipt,
  confirmOperation,
} from 'utils';
import { getAccount } from 'providers/wallet.js';

import { grantLossSocializerRole, setMaxLossSocializationBP } from './utils.js';

const healthWrite = health
  .command('write')
  .aliases(['w'])
  .description('health write commands');

healthWrite
  .command('force-rebalance')
  .description('force rebalance an unhealthy position')
  .argument('<address>', 'stv-steth-pool address', stringToAddress)
  .argument('<account>', 'account address to rebalance', stringToAddress)
  .option('--dry-run', 'preview without executing transaction')
  .action(
    async (
      address: Address,
      account: Address,
      options: {
        dryRun?: boolean;
      },
    ) => {
      const poolContract = await getStvStethPoolContract(address);
      const stethContract = await getStethContract();

      logInfo('Checking position health...\n');

      // Check if position is unhealthy
      const [isHealthy, stvBalance] = await Promise.all([
        callReadMethodSilent(poolContract, 'isHealthyOf', [account]),
        callReadMethodSilent(poolContract, 'balanceOf', [account]),
      ]);

      if (isHealthy) {
        logInfo(
          `✅ Account ${account} position is healthy. No rebalance needed.`,
        );
        return;
      }

      if (stvBalance === 0n) {
        logInfo(`⚠️  Account ${account} has no STV balance. Cannot rebalance.`);
        return;
      }

      // Preview rebalance
      logInfo('Fetching rebalance preview...\n');
      const [stethShares, stvToBurn, isUndercollateralized] =
        await callReadMethodSilent(poolContract, 'previewForceRebalance', [
          account,
        ]);

      const stethInEth = await callReadMethodSilent(
        stethContract,
        'getPooledEthBySharesRoundUp',
        [stethShares],
      );

      // Display preview
      logInfo('═'.repeat(70));
      logInfo('FORCE REBALANCE PREVIEW');
      logInfo('═'.repeat(70) + '\n');

      logTable({
        data: [
          ['Pool', address],
          ['Account', account],
          ['', ''],
          ['STV to be Burned', `${formatUnits(stvToBurn, 27)} STV`],
          ['stETH Shares to Unlock', `${formatEther(stethShares)} shares`],
          ['stETH Value', `~${formatEther(stethInEth)} ETH`],
          ['', ''],
          [
            'Is Undercollateralized',
            isUndercollateralized ? '⚠️  YES - Cannot proceed!' : '✅ NO',
          ],
          [
            'Transaction Status',
            isUndercollateralized ? '❌ WILL REVERT' : '✅ Should succeed',
          ],
        ],
      });

      if (isUndercollateralized) {
        logInfo('\n' + '⚠️ '.repeat(35));
        logInfo(
          '⚠️  ERROR: Account is undercollateralized! Regular force rebalance will revert.',
        );
        logInfo(
          '⚠️  Use force-rebalance-and-socialize-loss instead (requires LOSS_SOCIALIZER_ROLE)',
        );
        logInfo('⚠️ '.repeat(35) + '\n');
        return;
      }

      if (options.dryRun) {
        logInfo('\n🔍 Dry run mode - no transaction will be executed.\n');
        return;
      }

      // Warning message
      logInfo('\n' + '⚠️ '.repeat(35));
      logInfo(
        '⚠️  WARNING: This action will permanently burn user STV tokens!',
      );
      logInfo(
        '⚠️  Make sure you have the authority to perform this operation.',
      );
      logInfo('⚠️ '.repeat(35) + '\n');

      const confirm = await confirmOperation(
        `Execute force rebalance for account ${account}?\nThis will burn ${formatUnits(stvToBurn, 27)} STV tokens.`,
      );

      if (!confirm) {
        logInfo('Operation cancelled.');
        return;
      }

      // Execute rebalance
      logInfo('\nExecuting force rebalance...\n');

      try {
        const result = await callWriteMethodWithReceipt({
          contract: poolContract,
          methodName: 'forceRebalance',
          payload: [account],
        });

        logInfo('✅ Force rebalance executed successfully!\n');
        logTable({
          data: [
            ['Transaction Hash', result.receipt?.transactionHash || 'N/A'],
            ['Block Number', result.receipt?.blockNumber?.toString() || 'N/A'],
            ['Gas Used', result.receipt?.gasUsed?.toString() || 'N/A'],
          ],
        });
      } catch (error) {
        logInfo(`❌ Force rebalance failed: ${error}\n`);
        throw error;
      }
    },
  );

healthWrite
  .command('force-rebalance-and-socialize-loss')
  .description(
    'force rebalance an undercollateralized position with loss socialization (requires LOSS_SOCIALIZER_ROLE)',
  )
  .argument('<address>', 'stv-steth-pool address', stringToAddress)
  .argument('<account>', 'account address to rebalance', stringToAddress)
  .option('--dry-run', 'preview without executing transaction')
  .action(
    async (
      address: Address,
      account: Address,
      options: {
        dryRun?: boolean;
      },
    ) => {
      const poolContract = await getStvStethPoolContract(address);
      const stethContract = await getStethContract();
      const currentAccount = await getAccount();

      await grantLossSocializerRole(address, currentAccount.address);
      await setMaxLossSocializationBP(address);

      logInfo('Checking position health and permissions...\n');

      // Check LOSS_SOCIALIZER_ROLE
      const LOSS_SOCIALIZER_ROLE = await callReadMethodSilent(
        poolContract,
        'LOSS_SOCIALIZER_ROLE',
      );

      const hasRole = await callReadMethodSilent(poolContract, 'hasRole', [
        LOSS_SOCIALIZER_ROLE,
        currentAccount.address,
      ]);

      if (!hasRole) {
        logInfo(
          `❌ Error: Your account ${currentAccount.address} does not have LOSS_SOCIALIZER_ROLE`,
        );
        logInfo(`Required role: ${LOSS_SOCIALIZER_ROLE}\n`);
        return;
      }

      // Check if position is unhealthy
      const [isHealthy, stvBalance] = await Promise.all([
        callReadMethodSilent(poolContract, 'isHealthyOf', [account]),
        callReadMethodSilent(poolContract, 'balanceOf', [account]),
      ]);

      if (isHealthy) {
        logInfo(
          `✅ Account ${account} position is healthy. No rebalance needed.`,
        );
        return;
      }

      if (stvBalance === 0n) {
        logInfo(`⚠️  Account ${account} has no STV balance. Cannot rebalance.`);
        return;
      }

      // Preview rebalance
      logInfo('Fetching rebalance preview...\n');
      const [stethShares, stvToBurn, isUndercollateralized] =
        await callReadMethodSilent(poolContract, 'previewForceRebalance', [
          account,
        ]);

      const [stethInEth, maxLossSocializationBP, totalSupply] =
        await Promise.all([
          callReadMethodSilent(stethContract, 'getPooledEthBySharesRoundUp', [
            stethShares,
          ]),
          callReadMethodSilent(poolContract, 'maxLossSocializationBP'),
          callReadMethodSilent(poolContract, 'totalSupply'),
        ]);

      // Calculate estimated loss
      const stvValueInEth = await callReadMethodSilent(
        poolContract,
        'previewRedeem',
        [stvToBurn],
      );
      const estimatedLoss =
        stethInEth > stvValueInEth ? stethInEth - stvValueInEth : 0n;
      const lossPercentage =
        totalSupply > 0n ? Number((estimatedLoss * 10000n) / totalSupply) : 0;

      // Display preview
      logInfo('═'.repeat(70));
      logInfo('FORCE REBALANCE WITH LOSS SOCIALIZATION PREVIEW');
      logInfo('═'.repeat(70) + '\n');

      if (!isUndercollateralized) {
        logInfo('⚠️  NOTE: Account is NOT undercollateralized.');
        logInfo(
          '⚠️  Consider using regular force-rebalance instead to avoid loss socialization.\n',
        );
      }

      logTable({
        data: [
          ['Pool', address],
          ['Account', account],
          ['Operator', currentAccount.address],
          ['', ''],
          ['STV to be Burned', `${formatUnits(stvToBurn, 27)} STV`],
          ['STV Value (ETH)', `${formatEther(stvValueInEth)} ETH`],
          ['stETH Shares to Unlock', `${formatEther(stethShares)} shares`],
          ['stETH Value (ETH)', `${formatEther(stethInEth)} ETH`],
          ['', ''],
          [
            'Is Undercollateralized',
            isUndercollateralized ? '⚠️  YES' : '✅ NO',
          ],
          ['Estimated Loss', `~${formatEther(estimatedLoss)} ETH`],
          ['Loss % of Total Supply', `${(lossPercentage / 100).toFixed(4)}%`],
          ['', ''],
          [
            'Max Loss Socialization BP',
            `${maxLossSocializationBP} (${(Number(maxLossSocializationBP) / 100).toFixed(2)}%)`,
          ],
          [
            'Loss Within Limits',
            lossPercentage <= Number(maxLossSocializationBP)
              ? '✅ YES'
              : '❌ NO',
          ],
        ],
      });

      if (lossPercentage > Number(maxLossSocializationBP)) {
        logInfo('\n❌ ERROR: Estimated loss exceeds maxLossSocializationBP!');
        logInfo('Transaction will revert.\n');
        return;
      }

      if (options.dryRun) {
        logInfo('\n🔍 Dry run mode - no transaction will be executed.\n');
        return;
      }

      // Critical warning message
      logInfo('\n' + '🚨 '.repeat(35));
      logInfo('🚨  CRITICAL WARNING:');
      logInfo('🚨  This action will:');
      logInfo('🚨    1. Permanently burn user STV tokens');
      logInfo('🚨    2. Socialize losses across ALL pool participants');
      logInfo('🚨    3. Reduce the share rate for ALL users');
      logInfo('🚨    4. Cannot be undone');
      logInfo('🚨 '.repeat(35) + '\n');

      const confirm = await confirmOperation(
        `Execute force rebalance with loss socialization for account ${account}?\n` +
          `This will burn ${formatEther(stvToBurn)} STV and socialize ~${formatEther(estimatedLoss)} ETH loss.\n` +
          `Type 'yes' to confirm:`,
      );

      if (!confirm) {
        logInfo('Operation cancelled.');
        return;
      }

      // Double confirmation
      const doubleConfirm = await confirmOperation(
        'Are you ABSOLUTELY sure? This is your last chance to cancel. Type "CONFIRM" to proceed:',
      );

      if (!doubleConfirm) {
        logInfo('Operation cancelled.');
        return;
      }

      // Execute rebalance with loss socialization
      logInfo('\nExecuting force rebalance with loss socialization...\n');

      try {
        const result = await callWriteMethodWithReceipt({
          contract: poolContract,
          methodName: 'forceRebalanceAndSocializeLoss',
          payload: [account],
        });

        logInfo(
          '✅ Force rebalance with loss socialization executed successfully!\n',
        );
        logTable({
          data: [
            ['Transaction Hash', result.receipt?.transactionHash || 'N/A'],
            ['Block Number', result.receipt?.blockNumber?.toString() || 'N/A'],
            ['Gas Used', result.receipt?.gasUsed?.toString() || 'N/A'],
            ['', ''],
            ['⚠️  Loss Socialized', `~${formatEther(estimatedLoss)} ETH`],
            ['⚠️  All pool users affected', 'Share rate reduced'],
          ],
        });
      } catch (error) {
        logInfo(
          `❌ Force rebalance with loss socialization failed: ${error}\n`,
        );
        throw error;
      }
    },
  );
