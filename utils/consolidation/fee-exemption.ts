import { Address, formatEther, Hex } from 'viem';

import { getPublicClient } from 'providers';
import { DashboardAbi } from 'abi';

import { bigIntMax, bigIntMin } from '../big-int.js';

const AVG_BLOCK_TIME_SEC = 12n;

// providers commonly cap eth_getLogs at 10k blocks
const MAX_LOG_RANGE_BLOCKS = 10_000n;

// retries happen within hours; a wider window matches the previous batch's
// exemption instead, since batch amounts are round and repeat
export const FEE_EXEMPTION_DUPLICATE_LOOKBACK_SEC = 24n * 60n * 60n; // 24 hours

export type SettledGrowthSetLog = {
  transactionHash: Hex;
  blockNumber: bigint;
  args: { oldSettledGrowth: bigint; newSettledGrowth: bigint };
};

export type FeeExemptionMatch = {
  txHash: Hex;
  blockNumber: bigint;
  delta: bigint;
  timestamp: bigint;
};

// disburseFee also emits SettledGrowthSet; only corrections emit CorrectionTimestampUpdated
export const matchFeeExemptionLogs = (
  settledGrowthLogs: SettledGrowthSetLog[],
  correctionTxHashes: Set<Hex>,
  amount: bigint,
): Omit<FeeExemptionMatch, 'timestamp'>[] =>
  settledGrowthLogs
    .filter((log) => correctionTxHashes.has(log.transactionHash))
    .map((log) => ({
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      delta: log.args.newSettledGrowth - log.args.oldSettledGrowth,
    }))
    .filter((match) => match.delta === amount);

// viem does not validate log envelope fields at runtime
export const formatFeeExemptionMatch = (match: FeeExemptionMatch): string => {
  const txHash = /^0x[0-9a-fA-F]{64}$/.test(match.txHash)
    ? match.txHash
    : '<invalid tx hash from RPC>';
  const timestampMs = Number(match.timestamp) * 1000;
  const at = Number.isSafeInteger(timestampMs)
    ? new Date(timestampMs).toISOString()
    : '<invalid timestamp from RPC>';

  return `${formatEther(match.delta)} ETH in tx ${txHash} at ${at}`;
};

export const findRecentFeeExemptions = async (
  dashboard: Address,
  amount: bigint,
  lookbackSec: bigint = FEE_EXEMPTION_DUPLICATE_LOOKBACK_SEC,
): Promise<FeeExemptionMatch[]> => {
  const publicClient = await getPublicClient();
  const currentBlock = await publicClient.getBlockNumber();
  const lookbackBlocks = lookbackSec / AVG_BLOCK_TIME_SEC;
  const fromBlock = bigIntMax(currentBlock - lookbackBlocks, 0n);

  const settledGrowthLogs = [];
  const correctionLogs = [];

  for (
    let chunkStart = fromBlock;
    chunkStart <= currentBlock;
    chunkStart += MAX_LOG_RANGE_BLOCKS
  ) {
    const toBlock = bigIntMin(
      chunkStart + MAX_LOG_RANGE_BLOCKS - 1n,
      currentBlock,
    );

    const [chunkSettledGrowthLogs, chunkCorrectionLogs] = await Promise.all([
      publicClient.getContractEvents({
        address: dashboard,
        abi: DashboardAbi,
        eventName: 'SettledGrowthSet',
        fromBlock: chunkStart,
        toBlock,
        strict: true,
      }),
      publicClient.getContractEvents({
        address: dashboard,
        abi: DashboardAbi,
        eventName: 'CorrectionTimestampUpdated',
        fromBlock: chunkStart,
        toBlock,
        strict: true,
      }),
    ]);

    settledGrowthLogs.push(...chunkSettledGrowthLogs);
    correctionLogs.push(...chunkCorrectionLogs);
  }

  const correctionTxHashes = new Set(
    correctionLogs.map((log) => log.transactionHash),
  );
  const matches = matchFeeExemptionLogs(
    settledGrowthLogs,
    correctionTxHashes,
    amount,
  );

  return Promise.all(
    matches.map(async (match) => {
      const block = await publicClient.getBlock({
        blockNumber: match.blockNumber,
      });
      return { ...match, timestamp: block.timestamp };
    }),
  );
};
