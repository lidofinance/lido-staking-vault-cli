import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hex } from 'viem';

import {
  matchFeeExemptionLogs,
  findRecentFeeExemptions,
  formatFeeExemptionMatch,
  SettledGrowthSetLog,
} from '../../utils/consolidation/fee-exemption.js';

const mockGetBlockNumber = vi.fn();
const mockGetContractEvents = vi.fn();
const mockGetBlock = vi.fn();

vi.mock('providers', () => ({
  getPublicClient: async () => ({
    getBlockNumber: mockGetBlockNumber,
    getContractEvents: mockGetContractEvents,
    getBlock: mockGetBlock,
  }),
}));

const TX_EXEMPTION = '0xaaa1' as Hex;
const TX_DISBURSE = '0xbbb2' as Hex;
const TX_OTHER = '0xccc3' as Hex;
const DASHBOARD = '0x1234567890abcdef1234567890abcdef12345678';

const settledGrowthLog = (
  transactionHash: Hex,
  oldSettledGrowth: bigint,
  newSettledGrowth: bigint,
  blockNumber = 100n,
): SettledGrowthSetLog => ({
  transactionHash,
  blockNumber,
  args: { oldSettledGrowth, newSettledGrowth },
});

describe('matchFeeExemptionLogs', () => {
  it('matches a correction tx with delta equal to the amount', () => {
    const logs = [settledGrowthLog(TX_EXEMPTION, 100n, 132n)];
    const matches = matchFeeExemptionLogs(logs, new Set([TX_EXEMPTION]), 32n);

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ txHash: TX_EXEMPTION, delta: 32n });
  });

  it('ignores SettledGrowthSet from disburseFee (no correction event in tx)', () => {
    const logs = [settledGrowthLog(TX_DISBURSE, 100n, 132n)];
    const matches = matchFeeExemptionLogs(logs, new Set(), 32n);

    expect(matches).toHaveLength(0);
  });

  it('ignores corrections with a different delta', () => {
    const logs = [
      settledGrowthLog(TX_EXEMPTION, 100n, 132n),
      settledGrowthLog(TX_OTHER, 132n, 196n),
    ];
    const matches = matchFeeExemptionLogs(
      logs,
      new Set([TX_EXEMPTION, TX_OTHER]),
      64n,
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]?.txHash).toBe(TX_OTHER);
  });

  it('ignores downward corrections (negative delta)', () => {
    const logs = [settledGrowthLog(TX_OTHER, 132n, 100n)];
    const matches = matchFeeExemptionLogs(logs, new Set([TX_OTHER]), 32n);

    expect(matches).toHaveLength(0);
  });

  it('returns all matching corrections', () => {
    const logs = [
      settledGrowthLog(TX_EXEMPTION, 100n, 132n, 100n),
      settledGrowthLog(TX_OTHER, 132n, 164n, 200n),
    ];
    const matches = matchFeeExemptionLogs(
      logs,
      new Set([TX_EXEMPTION, TX_OTHER]),
      32n,
    );

    expect(matches).toHaveLength(2);
  });
});

describe('formatFeeExemptionMatch', () => {
  const VALID_HASH = `0x${'ab'.repeat(32)}` as Hex;

  it('renders a valid hash and timestamp', () => {
    const line = formatFeeExemptionMatch({
      txHash: VALID_HASH,
      blockNumber: 100n,
      delta: 32_000_000_000_000_000_000n,
      timestamp: 1_700_000_000n,
    });

    expect(line).toBe(`32 ETH in tx ${VALID_HASH} at 2023-11-14T22:13:20.000Z`);
  });

  it('replaces a tx hash carrying terminal escape sequences', () => {
    const line = formatFeeExemptionMatch({
      txHash: '[2K[1ASkip the exemption' as Hex,
      blockNumber: 100n,
      delta: 32_000_000_000_000_000_000n,
      timestamp: 1_700_000_000n,
    });

    expect(line).toContain('<invalid tx hash from RPC>');
    expect(line).not.toContain('');
  });

  it('replaces a non-hex tx hash of the right length', () => {
    const line = formatFeeExemptionMatch({
      txHash: `0x${'zz'.repeat(32)}` as Hex,
      blockNumber: 100n,
      delta: 1n,
      timestamp: 1_700_000_000n,
    });

    expect(line).toContain('<invalid tx hash from RPC>');
  });

  it('replaces an out-of-range timestamp instead of throwing', () => {
    const line = formatFeeExemptionMatch({
      txHash: VALID_HASH,
      blockNumber: 100n,
      delta: 1n,
      timestamp: 2n ** 64n,
    });

    expect(line).toContain('<invalid timestamp from RPC>');
  });
});

describe('findRecentFeeExemptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // mimics an RPC honouring fromBlock/toBlock, so chunked scans see each log once
  const mockChainLogs = (
    settledGrowthLogs: SettledGrowthSetLog[],
    correctionTxHashes: Hex[],
  ) => {
    mockGetContractEvents.mockImplementation(
      async ({ eventName, fromBlock, toBlock }) => {
        const inRange = settledGrowthLogs.filter(
          (log) => log.blockNumber >= fromBlock && log.blockNumber <= toBlock,
        );
        if (eventName === 'SettledGrowthSet') return inRange;

        return inRange
          .filter((log) => correctionTxHashes.includes(log.transactionHash))
          .map((log) => ({ transactionHash: log.transactionHash }));
      },
    );
  };

  it('returns matching exemptions with block timestamps', async () => {
    mockGetBlockNumber.mockResolvedValue(1_000_000n);
    mockChainLogs(
      [
        settledGrowthLog(TX_EXEMPTION, 100n, 132n, 999_000n),
        settledGrowthLog(TX_DISBURSE, 132n, 150n, 999_500n),
      ],
      [TX_EXEMPTION],
    );
    mockGetBlock.mockResolvedValue({ timestamp: 1_700_000_000n });

    const matches = await findRecentFeeExemptions(DASHBOARD, 32n);

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      txHash: TX_EXEMPTION,
      delta: 32n,
      timestamp: 1_700_000_000n,
    });
  });

  it('queries both events over the same block range', async () => {
    mockGetBlockNumber.mockResolvedValue(1_000_000n);
    mockGetContractEvents.mockResolvedValue([]);

    // 1200 sec / 12 sec per block = 100 blocks back, fits in a single chunk
    await findRecentFeeExemptions(DASHBOARD, 32n, 1200n);

    const ranges = mockGetContractEvents.mock.calls.map(
      ([{ fromBlock, toBlock }]) => [fromBlock, toBlock],
    );
    expect(ranges).toEqual([
      [999_900n, 1_000_000n],
      [999_900n, 1_000_000n],
    ]);
  });

  it('splits a wide lookback into chunks without rescanning blocks', async () => {
    mockGetBlockNumber.mockResolvedValue(100_000n);
    mockGetContractEvents.mockResolvedValue([]);

    // 25 000 blocks back over a 10 000-block chunk size = 3 chunks per event
    await findRecentFeeExemptions(DASHBOARD, 32n, 25_000n * 12n);

    const settledGrowthRanges = mockGetContractEvents.mock.calls
      .filter(([{ eventName }]) => eventName === 'SettledGrowthSet')
      .map(([{ fromBlock, toBlock }]) => [fromBlock, toBlock]);
    expect(settledGrowthRanges).toEqual([
      [75_000n, 84_999n],
      [85_000n, 94_999n],
      [95_000n, 100_000n],
    ]);
  });

  it('clamps fromBlock to 0 when the chain is shorter than the lookback', async () => {
    mockGetBlockNumber.mockResolvedValue(10n);
    mockGetContractEvents.mockResolvedValue([]);

    await findRecentFeeExemptions(DASHBOARD, 32n);

    const firstCall = mockGetContractEvents.mock.calls[0];
    expect(firstCall?.[0]?.fromBlock).toBe(0n);
    expect(firstCall?.[0]?.toBlock).toBe(10n);
  });

  it('returns empty when only disburse events exist', async () => {
    mockGetBlockNumber.mockResolvedValue(1_000_000n);
    mockChainLogs([settledGrowthLog(TX_DISBURSE, 100n, 132n, 999_000n)], []);

    const matches = await findRecentFeeExemptions(DASHBOARD, 32n);

    expect(matches).toHaveLength(0);
    expect(mockGetBlock).not.toHaveBeenCalled();
  });
});
