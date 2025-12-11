import { Address, zeroAddress } from 'viem';
import { getPublicClient } from 'providers';
import {
  logInfo,
  logError,
  getIndexedEventsFromCache,
  type CachedEvents,
  callReadMethodSilent,
  confirmOperation,
  logCancel,
} from 'utils';
import {
  grantRoleFromImpersonatedAccount,
  callMethodFromImpersonatedAccount,
} from 'features';
import { getStvStethPoolContract } from 'contracts/defi-wrapper/index.js';

const TOTAL_BASIS_POINTS = 10000n;

const fetchEventsForBlocks = async ({
  blocks,
  poolAddress,
  batchSize = 30000,
}: {
  blocks: bigint[];
  poolAddress: Address;
  batchSize?: number;
}): Promise<Map<bigint, CachedEvents>> => {
  const publicClient = await getPublicClient();
  const eventsMap = new Map<bigint, CachedEvents>();

  // Initialize empty events for each block
  for (const block of blocks) {
    eventsMap.set(block, {
      transfer: [],
      minted: [],
      burned: [],
    });
  }

  if (blocks.length === 0) return eventsMap;

  // Split blocks into batches based on block range
  const batches: bigint[][] = [];
  let currentBatch: bigint[] = [];
  let batchStartBlock: bigint = blocks[0] as bigint;

  for (const block of blocks) {
    // If block is within batch size range from start, add to current batch
    if (block - batchStartBlock < batchSize) {
      currentBatch.push(block);
    } else {
      // Start new batch
      batches.push(currentBatch);
      currentBatch = [block];
      batchStartBlock = block;
    }
  }
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  logInfo(
    `Fetching events for ${blocks.length} blocks in ${batches.length} batch(es) (max ${batchSize} blocks per batch)...`,
  );

  // Fetch each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    if (!batch || batch.length === 0) continue;

    const blocksSet = new Set(batch);
    const minBlock = batch[0] as bigint;
    const maxBlock = batch[batch.length - 1] as bigint;

    logInfo(
      `Batch ${i + 1}/${batches.length}: fetching blocks ${minBlock} to ${maxBlock} (${batch.length} blocks)...`,
    );

    try {
      // Fetch all events in parallel for this batch
      const [transferLogs, mintedLogs, burnedLogs] = await Promise.all([
        publicClient.getLogs({
          address: poolAddress,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'value', type: 'uint256' },
            ],
          },
          fromBlock: minBlock,
          toBlock: maxBlock,
        }),
        publicClient.getLogs({
          address: poolAddress,
          event: {
            type: 'event',
            name: 'StethSharesMinted',
            inputs: [
              { indexed: true, name: 'account', type: 'address' },
              { indexed: false, name: 'stethShares', type: 'uint256' },
            ],
          },
          fromBlock: minBlock,
          toBlock: maxBlock,
        }),
        publicClient.getLogs({
          address: poolAddress,
          event: {
            type: 'event',
            name: 'StethSharesBurned',
            inputs: [
              { indexed: true, name: 'account', type: 'address' },
              { indexed: false, name: 'stethShares', type: 'uint256' },
            ],
          },
          fromBlock: minBlock,
          toBlock: maxBlock,
        }),
      ]);

      logInfo(
        `  Found ${transferLogs.length} Transfer, ${mintedLogs.length} Minted, ${burnedLogs.length} Burned events`,
      );

      // Group Transfer events by block
      for (const log of transferLogs) {
        const blockNumber = log.blockNumber;

        if (blockNumber && blocksSet.has(blockNumber) && log.args) {
          const blockEvents = eventsMap.get(blockNumber);

          if (blockEvents) {
            const args = log.args as {
              from: Address;
              to: Address;
              value: bigint;
            };

            if (args.from && args.to && args.value !== undefined) {
              blockEvents.transfer.push({
                blockNumber: blockNumber.toString(),
                from: args.from,
                to: args.to,
                value: args.value.toString(),
              });
            }
          }
        }
      }

      // Group Minted events by block
      for (const log of mintedLogs) {
        const blockNumber = log.blockNumber;

        if (blockNumber && blocksSet.has(blockNumber) && log.args) {
          const blockEvents = eventsMap.get(blockNumber);

          if (blockEvents) {
            const args = log.args as { account: Address; stethShares: bigint };

            if (args.account && args.stethShares !== undefined) {
              blockEvents.minted.push({
                blockNumber: blockNumber.toString(),
                account: args.account,
                stethShares: args.stethShares.toString(),
              });
            }
          }
        }
      }

      // Group Burned events by block
      for (const log of burnedLogs) {
        const blockNumber = log.blockNumber;

        if (blockNumber && blocksSet.has(blockNumber) && log.args) {
          const blockEvents = eventsMap.get(blockNumber);

          if (blockEvents) {
            const args = log.args as { account: Address; stethShares: bigint };

            if (args.account && args.stethShares !== undefined) {
              blockEvents.burned.push({
                blockNumber: blockNumber.toString(),
                account: args.account,
                stethShares: args.stethShares.toString(),
              });
            }
          }
        }
      }
    } catch (error) {
      logError(error, `Error fetching events for batch ${i + 1}: ${error}`);
      throw new Error(`Failed to fetch events for batch ${i + 1}: ${error}`);
    }
  }

  logInfo(`Processed events for ${eventsMap.size} blocks`);

  return eventsMap;
};

/**
 * Replicates the contract's _isThresholdBreached logic
 * @param assets - STV assets value in ETH (from previewRedeem)
 * @param stethShares - debt in stETH shares
 * @param debtInEth - debt in ETH (from getPooledEthBySharesRoundUp)
 * @param forcedRebalanceThresholdBP - threshold in basis points
 * @returns true if threshold is breached (position is unhealthy)
 */
export const isThresholdBreached = ({
  assets,
  stethShares,
  debtInEth,
  forcedRebalanceThresholdBP,
  verbose,
}: {
  assets: bigint;
  stethShares: bigint;
  debtInEth: bigint;
  forcedRebalanceThresholdBP: bigint;
  verbose?: boolean;
}): boolean => {
  // If no debt, position is healthy
  if (stethShares === 0n) return false;

  // Calculate assetsThreshold using the same formula as contract:
  // assetsThreshold = mulDiv(
  //   getPooledEthBySharesRoundUp(_stethShares),
  //   TOTAL_BASIS_POINTS,
  //   TOTAL_BASIS_POINTS - forcedRebalanceThresholdBP(),
  //   Ceil
  // )

  const numerator = debtInEth * TOTAL_BASIS_POINTS;
  const denominator = TOTAL_BASIS_POINTS - forcedRebalanceThresholdBP;

  // mulDiv with ceiling rounding
  const assetsThreshold =
    numerator / denominator + (numerator % denominator > 0n ? 1n : 0n);

  if (verbose) {
    logInfo(`    [isThresholdBreached]
      numerator: ${numerator.toString()}
      denominator: ${denominator.toString()}
      assetsThreshold: ${assetsThreshold.toString()}
      assets: ${assets.toString()}
      breached: ${assets < assetsThreshold} (${assets} < ${assetsThreshold})
    `);
  }

  // Position is unhealthy if assets < assetsThreshold
  return assets < assetsThreshold;
};

/**
 * Calculate the "effective LTV ratio" for display purposes
 * This shows how close the position is to the threshold
 * Returns basis points (10000 = 100%)
 */
export const calculateEffectiveLTV = ({
  assets,
  debtInEth,
}: {
  assets: bigint;
  debtInEth: bigint;
}): number => {
  if (assets === 0n) return 0;

  // Simple debt/collateral ratio in basis points
  return Number((debtInEth * 10000n) / assets);
};

/**
 * Calculate how much the position exceeds the threshold
 * Returns basis points of how much over threshold (negative if healthy)
 */
export const calculateThresholdExcess = ({
  assets,
  stethShares,
  debtInEth,
  forcedRebalanceThresholdBP,
  verbose,
}: {
  assets: bigint;
  stethShares: bigint;
  debtInEth: bigint;
  forcedRebalanceThresholdBP: bigint;
  verbose?: boolean;
}): number => {
  if (stethShares === 0n) return 0;

  const numerator = debtInEth * TOTAL_BASIS_POINTS;
  const denominator = TOTAL_BASIS_POINTS - forcedRebalanceThresholdBP;
  const assetsThreshold =
    numerator / denominator + (numerator % denominator > 0n ? 1n : 0n);

  // How much short of threshold? (negative means healthy margin)
  const shortfall = assetsThreshold - assets;

  if (verbose) {
    logInfo(`    [calculateThresholdExcess]
      assetsThreshold: ${assetsThreshold.toString()}
      assets: ${assets.toString()}
      shortfall: ${shortfall.toString()} (threshold - assets)
    `);
  }

  // Convert to percentage of assets
  if (assets === 0n) return 0;

  const excessBP = Number((shortfall * 10000n) / assets);
  if (verbose) {
    logInfo(`      excessBP: ${excessBP} (${(excessBP / 100).toFixed(2)}%)`);
  }

  return excessBP;
};

// Helper function to index accounts from events
export const indexAccountsFromEvents = async ({
  poolAddress,
  fromBlock,
  toBlock,
  batchSize,
}: {
  poolAddress: Address;
  fromBlock?: number;
  toBlock?: number;
  batchSize?: number;
}): Promise<Set<Address>> => {
  const publicClient = await getPublicClient();

  const from = fromBlock ? BigInt(fromBlock) : undefined;
  const to = toBlock ? BigInt(toBlock) : await publicClient.getBlockNumber();

  // Calculate block range
  const startBlock = from || (to - 10000n > 0n ? to - 10000n : 0n);

  logInfo(`Scanning blocks ${startBlock} to ${to}...`);

  // Get events from cache or fetch from blockchain
  const events = await getIndexedEventsFromCache({
    poolAddress,
    startBlock,
    endBlock: to,
    fetchEventsForBlocks: (blocks: bigint[]) =>
      fetchEventsForBlocks({ blocks, poolAddress, batchSize }),
  });

  // Extract unique accounts from cached events
  const accounts = new Set<Address>();

  for (const event of events.transfer) {
    if (event.from && event.from !== zeroAddress)
      accounts.add(event.from as Address);
    if (event.to && event.to !== zeroAddress) accounts.add(event.to as Address);
  }

  for (const event of events.minted) {
    if (event.account) {
      accounts.add(event.account as Address);
    }
  }

  for (const event of events.burned) {
    if (event.account) {
      accounts.add(event.account as Address);
    }
  }

  logInfo(`Found ${accounts.size} unique accounts in range`);

  return accounts;
};

/**
 * Calculate account balances from indexed events
 */
export const calculateBalancesFromEvents = async ({
  poolAddress,
  fromBlock,
  toBlock,
  batchSize,
}: {
  poolAddress: Address;
  fromBlock?: number;
  toBlock?: number;
  batchSize?: number;
}): Promise<
  Map<
    Address,
    {
      stvBalance: bigint;
      debtShares: bigint;
    }
  >
> => {
  const publicClient = await getPublicClient();
  const balances = new Map<
    Address,
    {
      stvBalance: bigint;
      debtShares: bigint;
    }
  >();

  const from = fromBlock ? BigInt(fromBlock) : undefined;
  const to = toBlock ? BigInt(toBlock) : await publicClient.getBlockNumber();

  // Calculate block range
  const startBlock = from || (to - 50000n > 0n ? to - 50000n : 0n);

  logInfo(
    `Calculating balances from events in blocks ${startBlock} to ${to}...`,
  );

  // Use the same indexing approach as indexAccountsFromEvents (with cache)
  const events = await getIndexedEventsFromCache({
    poolAddress,
    startBlock,
    endBlock: to,
    fetchEventsForBlocks: (blocks: bigint[]) =>
      fetchEventsForBlocks({ blocks, poolAddress, batchSize }),
  });

  logInfo(
    `Found ${events.transfer.length} Transfer, ${events.minted.length} Minted, ${events.burned.length} Burned events`,
  );

  // Helper to get or create balance entry
  const getBalance = (address: Address) => {
    let balance = balances.get(address);

    if (!balance) {
      balance = { stvBalance: 0n, debtShares: 0n };
      balances.set(address, balance);
    }
    return balance;
  };

  // Process Transfer events (STV balance changes)
  for (const event of events.transfer) {
    if (!event.from || !event.to || !event.value) {
      logInfo(`Skipping invalid Transfer event: ${JSON.stringify(event)}`);

      continue;
    }

    const from = event.from as Address;
    const to = event.to as Address;
    const value = BigInt(event.value);

    // Minting (from zero address)
    if (from === zeroAddress) {
      const balance = getBalance(to);
      balance.stvBalance += value;
    }
    // Burning (to zero address)
    else if (to === zeroAddress) {
      const balance = getBalance(from);
      balance.stvBalance -= value;

      if (balance.stvBalance < 0n) {
        logInfo(
          `Warning: Negative STV balance for ${from}: ${balance.stvBalance}`,
        );
      }
    }
    // Transfer between accounts
    else {
      const fromBalance = getBalance(from);
      const toBalance = getBalance(to);
      fromBalance.stvBalance -= value;
      toBalance.stvBalance += value;

      if (fromBalance.stvBalance < 0n) {
        logInfo(
          `Warning: Negative STV balance for ${from}: ${fromBalance.stvBalance}`,
        );
      }
    }
  }

  // Process StethSharesMinted events (debt increases)
  for (const event of events.minted) {
    if (!event.account || !event.stethShares) {
      logInfo(`Skipping invalid Minted event: ${JSON.stringify(event)}`);

      continue;
    }

    const account = event.account as Address;
    const stethShares = BigInt(event.stethShares);
    const balance = getBalance(account);
    balance.debtShares += stethShares;
  }

  // Process StethSharesBurned events (debt decreases)
  for (const event of events.burned) {
    if (!event.account || !event.stethShares) {
      logInfo(`Skipping invalid Burned event: ${JSON.stringify(event)}`);

      continue;
    }

    const account = event.account as Address;
    const stethShares = BigInt(event.stethShares);
    const balance = getBalance(account);
    balance.debtShares -= stethShares;

    if (balance.debtShares < 0n) {
      logInfo(
        `Warning: Negative debt shares for ${account}: ${balance.debtShares}`,
      );
    }
  }

  logInfo(`Calculated balances for ${balances.size} accounts`);

  return balances;
};

const TIME_LOCKER_ACCOUNT = '0x5513fd2E0770eA3f670944d2B36a1F0a10689B2d';

export const grantLossSocializerRole = async (
  address: Address,
  currentAccount: Address,
) => {
  const poolContract = await getStvStethPoolContract(address);
  const LOSS_SOCIALIZER_ROLE = await callReadMethodSilent(
    poolContract,
    'LOSS_SOCIALIZER_ROLE',
  );
  const roleMembers = await callReadMethodSilent(
    poolContract,
    'getRoleMembers',
    [LOSS_SOCIALIZER_ROLE],
  );
  if (!roleMembers.includes(currentAccount)) {
    logInfo(
      `Address ${currentAccount} does not have the LOSS_SOCIALIZER_ROLE role`,
    );

    const confirm = await confirmOperation(
      `Do you want set LOSS_SOCIALIZER_ROLE role for ${currentAccount}? Works only on Forked network like Anvil`,
    );
    if (!confirm) {
      logCancel('Operation cancelled.');
      return;
    }
  }

  await grantRoleFromImpersonatedAccount({
    currentAccount,
    contract: poolContract,
    impersonateAccount: TIME_LOCKER_ACCOUNT,
    role: LOSS_SOCIALIZER_ROLE,
    roleName: 'LOSS_SOCIALIZER_ROLE',
  });
};

export const setMaxLossSocializationBP = async (address: Address) => {
  const poolContract = await getStvStethPoolContract(address);
  const confirm = await confirmOperation(
    `Do you want set maxLossSocializationBP to 10000? Works only on Forked network like Anvil`,
  );
  if (!confirm) {
    logCancel('Operation cancelled.');
    return;
  }

  await callMethodFromImpersonatedAccount({
    contract: poolContract,
    impersonateAccount: TIME_LOCKER_ACCOUNT,
    functionName: 'setMaxLossSocializationBP',
    args: [10000],
  });
};
