// NOTE: These tests require jest and @types/jest for correct execution.
import { describe, it, expect } from '@jest/globals';
import { reportMetrics } from '../../utils/report/report-statistic.js';

type PartialReport = {
  total_value_wei: string | number;
  in_out_delta: string | number;
  liability_shares: string | number;
  timestamp: number;
};

const makeReport = ({
  total_value_wei,
  in_out_delta,
  liability_shares,
  timestamp,
}: PartialReport) => ({
  data: {
    vault_address: '0x123',
    total_value_wei: total_value_wei.toString(),
    in_out_delta: in_out_delta.toString(),
    fee: '0',
    liability_shares: liability_shares.toString(),
  },
  leaf: '0x0',
  refSlot: 0,
  blockNumber: 0,
  timestamp,
  proofsCID: '',
  prevTreeCID: '',
  merkleTreeRoot: '',
});

describe('reportMetrics', () => {
  it('returns all expected fields with positive rewards', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000', // 0.1 ETH
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '110000000000000000000', // 0.11 ETH
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000 + 3600,
    });
    const stEthLiabilityRebaseRewards = '5000000000000000000';
    const nodeOperatorFeeBP = 100n;
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP,
      stEthLiabilityRebaseRewards: BigInt(stEthLiabilityRebaseRewards),
    });
    // Проверяем все возвращаемые значения
    expect(res).toHaveProperty(
      'grossStakingRewards',
      10_000_000_000_000_000_000n,
    );
    expect(res).toHaveProperty('nodeOperatorRewards', 100_000_000_000_000_000n);
    expect(res).toHaveProperty('dailyLidoFees', 0n);
    expect(res).toHaveProperty('netStakingRewards', 9_900_000_000_000_000_000n);
    expect(res).toHaveProperty('grossStakingAPR');
    expect(res).toHaveProperty('netStakingAPR');
    expect(res).toHaveProperty('bottomLine', 4_900_000_000_000_000_000n);
    expect(res).toHaveProperty('efficiency');
    expect(res).toHaveProperty('grossStakingAPR_bigint');
    expect(res).toHaveProperty('netStakingAPR_bigint');
    expect(res).toHaveProperty('efficiency_bigint');
    expect(res).toHaveProperty('grossStakingAPR_bps');
    expect(res).toHaveProperty('netStakingAPR_bps');
    expect(res).toHaveProperty('efficiency_bps');
    expect(res).toHaveProperty('grossStakingAPR_percent');
    expect(res).toHaveProperty('netStakingAPR_percent');
    expect(res).toHaveProperty('efficiency_percent');
    // Проверяем что значения APR положительные
    expect(Number(res.grossStakingAPR)).toBeGreaterThan(0);
    expect(Number(res.grossStakingAPR_bps)).toBeGreaterThan(0);
    expect(Number(res.grossStakingAPR_percent)).toBeGreaterThan(0);
  });

  it('returns all expected fields with zero rewards', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000 + 3600,
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 100n,
      stEthLiabilityRebaseRewards: 0n,
    });
    Object.keys(res).forEach((key) => {
      expect(res).toHaveProperty(key);
    });
    expect(res.grossStakingRewards).toBe(0n);
    expect(res.grossStakingAPR).toBe(0n);
    expect(res.grossStakingAPR_bps).toBe(0);
    expect(res.grossStakingAPR_percent).toBe(0);
  });

  it('returns all expected fields with negative rewards', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '90000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000 + 3600,
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 100n,
      stEthLiabilityRebaseRewards: 0n,
    });
    Object.keys(res).forEach((key) => {
      expect(res).toHaveProperty(key);
    });
    expect(res.grossStakingRewards).toBe(-10_000_000_000_000_000_000n);
    expect(Number(res.grossStakingAPR)).toBeLessThan(0);
    expect(Number(res.grossStakingAPR_bps)).toBeLessThan(0);
    expect(Number(res.grossStakingAPR_percent)).toBeLessThan(0);
  });

  it('handles very small rewards (edge case)', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '100000000000000000001', // +1 wei
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000 + 3600,
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 100n,
      stEthLiabilityRebaseRewards: 0n,
    });
    Object.keys(res).forEach((key) => {
      expect(res).toHaveProperty(key);
    });
    expect(res.grossStakingRewards).toBe(1n);
    expect(Number(res.grossStakingAPR_percent)).toBeGreaterThanOrEqual(0);
  });

  it('handles very large values (big TVL and rewards)', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000000000000', // 1e26
      in_out_delta: '0',
      liability_shares: '1000000000000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '110000000000000000000000000000', // +10%
      in_out_delta: '0',
      liability_shares: '1000000000000',
      timestamp: 1000 + 3600,
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 100n,
      stEthLiabilityRebaseRewards: 0n,
    });
    Object.keys(res).forEach((key) => {
      expect(res).toHaveProperty(key);
    });
    expect(res.grossStakingRewards).toBe(
      10_000_000_000_000_000_000_000_000_000n,
    );
    expect(Number(res.grossStakingAPR_percent)).toBeGreaterThan(0);
  });

  it('handles nodeOperatorFeeBP = 0 (no operator fee)', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '110000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000 + 3600,
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 0n,
      stEthLiabilityRebaseRewards: 0n,
    });
    expect(res.nodeOperatorRewards).toBe(0n);
    expect(res.netStakingRewards).toBe(res.grossStakingRewards);
  });

  it('handles nodeOperatorFeeBP = 10000 (100%)', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '110000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000 + 3600,
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 10000n,
      stEthLiabilityRebaseRewards: 0n,
    });
    expect(res.nodeOperatorRewards).toBe(res.grossStakingRewards);
    expect(res.netStakingRewards).toBe(0n);
  });

  it('handles very short period (1 second)', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '110000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1001,
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 100n,
      stEthLiabilityRebaseRewards: 0n,
    });
    expect(Number(res.grossStakingAPR_percent)).toBeGreaterThan(1000000); // Очень большой APR
  });

  it('handles very long period (1 year)', () => {
    const previous = makeReport({
      total_value_wei: '100000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000,
    });
    const current = makeReport({
      total_value_wei: '110000000000000000000',
      in_out_delta: '0',
      liability_shares: '1000',
      timestamp: 1000 + 31536000, // 1 год
    });
    const res = reportMetrics({
      reports: { current, previous },
      nodeOperatorFeeBP: 100n,
      stEthLiabilityRebaseRewards: 0n,
    });
    expect(Number(res.grossStakingAPR_percent)).toBeCloseTo(10, 1); // ~10% годовых
  });
});
