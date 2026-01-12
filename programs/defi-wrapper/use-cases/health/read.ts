import { type Address, formatEther, formatUnits } from 'viem';
import { health } from './main.js';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/index.js';
import { getStethContract } from 'contracts/index.js';
import {
  stringToAddress,
  logTable,
  logInfo,
  callReadMethodSilent,
  stringToNumber,
  formatBP,
} from 'utils';
import { getPublicClient } from 'providers';

import {
  isThresholdBreached,
  calculateEffectiveLTV,
  calculateThresholdExcess,
  calculateBalancesFromEvents,
} from './utils.js';

const healthRead = health
  .command('read')
  .aliases(['r'])
  .description('health read commands');

interface UnhealthyPosition {
  account: Address;
  stvBalance: bigint;
  stvInEth: bigint;
  debtShares: bigint;
  debtInEth: bigint;
  ltvRatio: number; // in basis points
  isHealthy: boolean;
  thresholdExcess: number;
}

healthRead
  .command('list-unhealthy')
  .description('list all unhealthy positions in the pool')
  .argument('<address>', 'stv-steth-pool address', stringToAddress)
  .option('--from-block <number>', 'from block number', stringToNumber)
  .option(
    '--to-block <number>',
    'to block number (default: latest)',
    stringToNumber,
  )
  .option(
    '--batch-size <number>',
    'max blocks per RPC call (default: 30000)',
    stringToNumber,
  )
  .option('--verbose', 'show verbose output', false)
  .action(
    async (
      address: Address,
      options: {
        fromBlock?: number;
        toBlock?: number;
        batchSize?: number;
        verbose?: boolean;
      },
    ) => {
      const poolContract = await getStvStethPoolContract(address);
      const stethContract = await getStethContract();

      logInfo('Fetching pool configuration...');

      // Get pool configuration
      const [forcedRebalanceThresholdBP, name, symbol] = await Promise.all([
        callReadMethodSilent({
          contract: poolContract,
          methodName: 'forcedRebalanceThresholdBP',
          payload: [],
        }),
        callReadMethodSilent({
          contract: poolContract,
          methodName: 'name',
          payload: [],
        }),
        callReadMethodSilent({
          contract: poolContract,
          methodName: 'symbol',
          payload: [],
        }),
      ]);

      logInfo(
        `Pool: ${name} (${symbol}) at ${address}\nForced Rebalance Threshold: ${formatBP(forcedRebalanceThresholdBP)}\n`,
      );

      // Check health for each account
      const unhealthyPositions: UnhealthyPosition[] = [];

      // Calculate balances from indexed events
      logInfo('📊 Calculating balances from indexed events');
      const balances = await calculateBalancesFromEvents({
        poolAddress: address,
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
        batchSize: options.batchSize,
      });

      logInfo(
        `Found ${balances.size} accounts with positions. Checking health...\n`,
      );

      for (const [account, balance] of balances) {
        try {
          const stvBalance = balance.stvBalance;
          const debtShares = balance.debtShares;

          // Still check contract's isHealthy for comparison
          const isHealthy = await callReadMethodSilent({
            contract: poolContract,
            methodName: 'isHealthyOf',
            payload: [[account]],
          });

          if (options.verbose) {
            logInfo(`Account: ${account}
            stvBalance: ${formatUnits(stvBalance, 27)} STV
            debtShares: ${formatEther(debtShares)} shares 
            isHealthy (from contract): ${isHealthy}
          `);
          }

          // Skip accounts with no position
          if (stvBalance === 0n && debtShares === 0n) {
            if (options.verbose) {
              logInfo(`  Skipping account ${account} - no position\n`);
            }
            continue;
          }

          // Calculate values in ETH
          const stvInEth =
            stvBalance > 0n
              ? await callReadMethodSilent({
                  contract: poolContract,
                  methodName: 'previewRedeem',
                  payload: [[stvBalance]],
                })
              : 0n;

          const debtInEth =
            debtShares > 0n
              ? await callReadMethodSilent({
                  contract: stethContract,
                  methodName: 'getPooledEthBySharesRoundUp',
                  payload: [[debtShares]],
                })
              : 0n;

          if (options.verbose) {
            logInfo(`  stvInEth: ${formatEther(stvInEth)} ETH`);
            logInfo(`  debtInEth: ${formatEther(debtInEth)} ETH`);
            logInfo(
              `  forcedRebalanceThresholdBP: ${formatBP(forcedRebalanceThresholdBP)}`,
            );
          }

          // Use contract-accurate threshold check
          const thresholdBreached = isThresholdBreached({
            assets: stvInEth,
            stethShares: debtShares,
            debtInEth,
            forcedRebalanceThresholdBP,
            verbose: options.verbose,
          });
          // Calculate display metrics
          const ltvRatio = calculateEffectiveLTV({
            assets: stvInEth,
            debtInEth,
          });
          const thresholdExcess = calculateThresholdExcess({
            assets: stvInEth,
            stethShares: debtShares,
            debtInEth,
            forcedRebalanceThresholdBP,
            verbose: options.verbose,
          });

          if (options.verbose) {
            logInfo(`  thresholdBreached (our calc): ${thresholdBreached}
              ltvRatio: ${ltvRatio / 100}%
              thresholdExcess: ${thresholdExcess / 100}%
            `);
          }

          // Sanity check: contract's isHealthy should be inverse of our thresholdBreached
          // isHealthy = true means healthy, thresholdBreached = false means healthy
          if (isHealthy === thresholdBreached) {
            logInfo(
              `  ⚠️  MISMATCH: Contract isHealthy=${isHealthy}, our thresholdBreached=${thresholdBreached}`,
            );
            logInfo(
              `⚠️  WARNING: Health check mismatch for ${account}! Contract isHealthy=${isHealthy}, but our thresholdBreached=${thresholdBreached}`,
            );
          } else {
            if (options.verbose) {
              logInfo('  ✅ Health check matches contract');
            }
          }

          if (!isHealthy && stvBalance > 0n) {
            unhealthyPositions.push({
              account,
              stvBalance,
              stvInEth,
              debtShares,
              debtInEth,
              ltvRatio,
              isHealthy,
              thresholdExcess,
            });
          }
        } catch (error) {
          logInfo(`Error checking account ${account}: ${error}`);
        }
      }

      // Sort by threshold excess descending (most critical first)
      unhealthyPositions.sort((a, b) => b.thresholdExcess - a.thresholdExcess);

      if (unhealthyPositions.length === 0) {
        logInfo('✅ No unhealthy positions found!');
        return;
      }

      logInfo('⚠️  Unhealthy Positions Report\n');

      const tableData = unhealthyPositions.map((p) => [
        p.account,
        `${formatUnits(p.stvBalance, 27)} STV`,
        `${formatEther(p.debtShares)} shares`,
        `${formatEther(p.debtInEth)} ETH`,
        `${(p.ltvRatio / 100).toFixed(2)}%`, // Display LTV
        `+${(p.thresholdExcess / 100).toFixed(2)}%`, // How much over threshold
        p.thresholdExcess > 1000 // > 10% over threshold
          ? '🚨 CRITICAL'
          : '⚠️  UNHEALTHY',
      ]);

      logTable({
        params: {
          head: [
            'Account',
            'STV Balance',
            'Debt (shares)',
            'Debt (ETH)',
            'LTV Ratio',
            'Over Threshold',
            'Status',
          ],
        },
        data: tableData,
      });

      logInfo(`\nTotal Unhealthy Accounts: ${unhealthyPositions.length}`);
      logInfo(
        `Threshold: ${(Number(forcedRebalanceThresholdBP) / 100).toFixed(2)}%`,
      );
    },
  );

interface RebalanceRequirement {
  account: Address;
  stvToBurn: bigint;
  stethShares: bigint;
  stethInEth: bigint;
  isUndercollateralized: boolean;
}

healthRead
  .command('calculate-rebalance-need')
  .description(
    'calculate total ETH needed to rebalance all unhealthy positions',
  )
  .argument('<address>', 'stv-steth-pool address', stringToAddress)
  .option('--from-block <number>', 'from block number', stringToNumber)
  .option(
    '--batch-size <number>',
    'max blocks per RPC call (default: 30000)',
    stringToNumber,
  )
  .option('--verbose', 'show verbose output', false)
  .action(
    async (
      address: Address,
      options: {
        fromBlock?: number;
        batchSize?: number;
        verbose?: boolean;
      },
    ) => {
      const poolContract = await getStvStethPoolContract(address);
      const stethContract = await getStethContract();

      logInfo('Calculating rebalance requirements...\n');

      // Get pool info
      const [name, symbol, totalExceedingMintedSteth, vaultAddress] =
        await Promise.all([
          callReadMethodSilent({
            contract: poolContract,
            methodName: 'name',
            payload: [],
          }),
          callReadMethodSilent({
            contract: poolContract,
            methodName: 'symbol',
            payload: [],
          }),
          callReadMethodSilent({
            contract: poolContract,
            methodName: 'totalExceedingMintedSteth',
            payload: [],
          }),
          callReadMethodSilent({
            contract: poolContract,
            methodName: 'VAULT',
            payload: [],
          }),
        ]);

      logInfo(`Pool: ${name} (${symbol}) at ${address}\n`);

      // Calculate balances from indexed events
      const balances = await calculateBalancesFromEvents({
        poolAddress: address,
        fromBlock: options.fromBlock,
        batchSize: options.batchSize,
      });

      const rebalanceRequirements: RebalanceRequirement[] = [];
      let totalStethRequired = 0n;

      for (const [account, balance] of balances) {
        try {
          // Skip accounts with no position
          if (balance.stvBalance === 0n && balance.debtShares === 0n) {
            continue;
          }

          const isHealthy = await callReadMethodSilent({
            contract: poolContract,
            methodName: 'isHealthyOf',
            payload: [[account]],
          });

          if (!isHealthy) {
            // Call previewForceRebalance
            const [stethShares, stvToBurn, isUndercollateralized] =
              await callReadMethodSilent({
                contract: poolContract,
                methodName: 'previewForceRebalance',
                payload: [[account]],
              });

            if (stvToBurn > 0n) {
              // Convert stETH shares to ETH
              const stethInEth = await callReadMethodSilent({
                contract: stethContract,
                methodName: 'getPooledEthBySharesRoundUp',
                payload: [[stethShares]],
              });

              rebalanceRequirements.push({
                account,
                stvToBurn,
                stethShares,
                stethInEth,
                isUndercollateralized,
              });

              totalStethRequired += stethInEth;
            }
          }
        } catch (error) {
          logInfo(`Error processing account ${account}: ${error}`);
        }
      }

      // Get vault balance
      const publicClient = await getPublicClient();
      const vaultEthBalance = await publicClient.getBalance({
        address: vaultAddress,
      });

      // Calculate adjusted requirement after exceeding stETH
      // "Exceeding minted stETH" is already available in the pool and can be used
      // for rebalancing WITHOUT providing additional ETH.
      // So we subtract it from total required to get the REAL ETH need.
      const adjustedRequirement =
        totalStethRequired > totalExceedingMintedSteth
          ? totalStethRequired - totalExceedingMintedSteth
          : 0n;

      // Calculate ETH shortfall: how much MORE ETH is needed beyond vault balance
      const ethShortfall =
        adjustedRequirement > vaultEthBalance
          ? adjustedRequirement - vaultEthBalance
          : 0n;

      // Output summary
      logInfo('═'.repeat(70));
      logInfo('REBALANCE REQUIREMENTS REPORT');
      logInfo('═'.repeat(70) + '\n');

      logTable({
        data: [
          ['Pool', address],
          ['Pool Name', `${name} (${symbol})`],
          ['', ''],
          ['📊 Unhealthy Accounts', rebalanceRequirements.length.toString()],
          ['', ''],
          ['═══ REBALANCE NEEDS ═══', ''],
          [
            '1️⃣  Total stETH Required (raw)',
            `${formatEther(totalStethRequired)} ETH`,
          ],
          [
            '2️⃣  Exceeding Minted stETH (available)',
            totalExceedingMintedSteth > 0n
              ? `${formatEther(totalExceedingMintedSteth)} ETH ✅`
              : `${formatEther(totalExceedingMintedSteth)} ETH`,
          ],
          [
            '3️⃣  After Exceeding Adjustment',
            adjustedRequirement > 0n
              ? `${formatEther(adjustedRequirement)} ETH (real need)`
              : `${formatEther(adjustedRequirement)} ETH ✅ (covered by exceeding)`,
          ],
          ['', ''],
          ['═══ VAULT RESOURCES ═══', ''],
          ['💰 Vault ETH Balance', `${formatEther(vaultEthBalance)} ETH`],
          [
            '🎯 ETH Shortfall',
            ethShortfall > 0n
              ? `⚠️  ${formatEther(ethShortfall)} ETH (NEED MORE)`
              : `✅ ${formatEther(ethShortfall)} ETH (SUFFICIENT)`,
          ],
        ],
      });

      if (options.verbose && rebalanceRequirements.length > 0) {
        logInfo('\n' + '─'.repeat(70));
        logInfo('DETAILED BREAKDOWN BY ACCOUNT');
        logInfo('─'.repeat(70) + '\n');

        const detailedData = rebalanceRequirements.map((r) => [
          r.account,
          formatUnits(r.stvToBurn, 27),
          formatEther(r.stethShares),
          formatEther(r.stethInEth),
          r.isUndercollateralized ? '⚠️  Yes' : 'No',
        ]);

        logTable({
          params: {
            head: [
              'Account',
              'STV to Burn',
              'stETH Shares',
              'stETH (ETH)',
              'Undercollateralized',
            ],
          },
          data: detailedData,
        });
      }

      // Action items
      logInfo('\n' + '═'.repeat(70));
      logInfo('ACTION ITEMS');
      logInfo('═'.repeat(70) + '\n');

      if (rebalanceRequirements.length === 0) {
        logInfo('✅ No rebalance needed - all positions are healthy!\n');
      } else {
        // Explain the rebalance strategy
        if (totalExceedingMintedSteth > 0n) {
          logInfo(
            `1. 🔄 Can rebalance using exceeding stETH: ${formatEther(totalExceedingMintedSteth)} ETH`,
          );
          logInfo(
            `   This stETH is already in the pool and doesn't require external ETH`,
          );
        } else {
          logInfo(
            `1. 🔄 No exceeding stETH available - will need to provide ETH externally`,
          );
        }

        if (ethShortfall > 0n) {
          logInfo(
            `\n2. ⚠️  Need to provide ${formatEther(ethShortfall)} ETH from external source`,
          );
          logInfo(
            `   Command: yarn start dw stv-steth w rebalance-unassigned-liability-with-ether \\`,
          );
          logInfo(`            ${address} ${formatEther(ethShortfall)}`);
        } else if (adjustedRequirement > 0n) {
          logInfo(
            `\n2. ✅ Vault has sufficient ETH balance (${formatEther(vaultEthBalance)} ETH available)`,
          );
        } else {
          logInfo(
            '\n2. ✅ Exceeding stETH fully covers all rebalance needs - no ETH required!',
          );
        }

        logInfo(`\n3. 🎯 Execute rebalances for each account:`);
        logInfo(
          `   Command: yarn start dw uc h force-rebalance ${address} <account-address>`,
        );

        const undercollateralizedCount = rebalanceRequirements.filter(
          (r) => r.isUndercollateralized,
        ).length;
        if (undercollateralizedCount > 0) {
          logInfo(
            `\n⚠️  CRITICAL: ${undercollateralizedCount} of ${rebalanceRequirements.length} accounts are UNDERCOLLATERALIZED!`,
          );
          logInfo(
            '   These positions have debt > collateral and will cause LOSSES.',
          );
          logInfo('   Requires: LOSS_SOCIALIZER_ROLE to execute');
          logInfo(
            `   Command: yarn start dw uc h force-rebalance-and-socialize-loss ${address} <account-address>`,
          );
        }
        logInfo('');
      }
    },
  );
