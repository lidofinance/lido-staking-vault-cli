import { describe, it, expect } from 'vitest';
import { calculateLidoAPR, SECONDS_IN_YEAR } from 'utils/lido-apr.js';

describe('calculateLidoAPR', () => {
  it('should calculate APR for positive share rate increase', () => {
    const preShareRate = 1;
    const postShareRate = 1.05; // 5% increase
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    // Expected: 5% annual increase = 5% APR
    expect(apr).toBeCloseTo(5, 2);
  });

  it('should calculate APR for 10% annual increase', () => {
    const preShareRate = 1;
    const postShareRate = 1.1; // 10% increase
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);
    expect(apr).toBeCloseTo(10, 2);
  });

  it('should annualize APR for half year period', () => {
    const preShareRate = 1;
    const postShareRate = 1.05; // 5% increase over 6 months
    const timeElapsed = SECONDS_IN_YEAR / 2;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    // Expected: 5% over 6 months = 10% annualized
    expect(apr).toBeCloseTo(10, 2);
  });

  it('should annualize APR for one month period', () => {
    const preShareRate = 1;
    const postShareRate = 1.01; // 1% increase over 1 month
    const timeElapsed = SECONDS_IN_YEAR / 12;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    // Expected: 1% per month = 12% annualized
    expect(apr).toBeCloseTo(12, 2);
  });

  it('should handle negative APR (share rate decrease)', () => {
    const preShareRate = 1;
    const postShareRate = 0.95; // 5% decrease
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    // Expected: -5% annual decrease = -5% APR
    expect(apr).toBeCloseTo(-5, 2);
  });

  it('should return 0 when share rate is unchanged', () => {
    const preShareRate = 1;
    const postShareRate = 1;
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);
    expect(apr).toBe(0);
  });

  it('should return 0 when preShareRate is 0', () => {
    const preShareRate = 0;
    const postShareRate = 1.05;
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);
    expect(apr).toBe(0);
  });

  it('should return 0 when timeElapsed is 0', () => {
    const preShareRate = 1;
    const postShareRate = 1.05;
    const timeElapsed = 0;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);
    expect(apr).toBe(0);
  });

  it('should handle very small share rate changes', () => {
    const preShareRate = 1;
    const postShareRate = 1.0001; // 0.01% increase
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);
    expect(apr).toBeCloseTo(0.01, 2);
  });

  it('should handle large share rate values', () => {
    const preShareRate = 1000000;
    const postShareRate = 1050000; // 5% increase
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);
    expect(apr).toBeCloseTo(5, 2);
  });

  it('should calculate APR for one day period', () => {
    const preShareRate = 1;
    const postShareRate = 1.0001; // 0.01% increase over 1 day
    const timeElapsed = 24 * 60 * 60; // 1 day in seconds

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    // Expected: 0.01% per day * 365 days = 3.65% annualized
    expect(apr).toBeCloseTo(3.65, 2);
  });

  it('should calculate APR for fractional share rates', () => {
    const preShareRate = 1.123456;
    const postShareRate = 1.234567;
    const timeElapsed = SECONDS_IN_YEAR;

    const apr = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    // Expected: ((1.234567 - 1.123456) / 1.123456) * 100 ≈ 9.89%
    expect(apr).toBeCloseTo(9.89, 1);
  });
});
