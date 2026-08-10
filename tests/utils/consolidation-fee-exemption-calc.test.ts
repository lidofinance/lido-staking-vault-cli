import { describe, it, expect, vi, beforeEach } from 'vitest';

import { consolidatedBalance } from '../../utils/consolidation/validator-info.js';
import {
  VALID_PUBKEY_1,
  VALID_PUBKEY_2,
  VALID_PUBKEY_3,
  createValidatorInfo,
  createTargetAndSourceMap,
} from '../fixtures/consolidation-fixtures.js';

const mockConfirmOperation = vi.fn();

vi.mock('utils', async () => {
  const logging = await vi.importActual<
    typeof import('utils/logging/console.js')
  >('../../utils/logging/console.js');

  return {
    ...logging,
    confirmOperation: mockConfirmOperation,
  };
});

const importSubject = async () => {
  const { calculateAndConfirmFeeExemption } =
    await import('../../utils/consolidation/confirms.js');
  return calculateAndConfirmFeeExemption;
};

const ETH = 1_000_000_000_000_000_000n;

describe('consolidatedBalance', () => {
  it('returns the effective balance when it is below the actual balance', () => {
    const info = createValidatorInfo({
      balance: 32n * ETH + ETH / 2n,
      effectiveBalance: 32n * ETH,
    });

    expect(consolidatedBalance(info)).toBe(32n * ETH);
  });

  it('returns the actual balance when it dropped below the effective balance', () => {
    const info = createValidatorInfo({
      balance: 31n * ETH,
      effectiveBalance: 32n * ETH,
    });

    expect(consolidatedBalance(info)).toBe(31n * ETH);
  });

  it('returns zero for a slashed validator', () => {
    const info = createValidatorInfo({
      balance: 32n * ETH,
      effectiveBalance: 32n * ETH,
      slashed: true,
    });

    expect(consolidatedBalance(info)).toBe(0n);
  });
});

describe('calculateAndConfirmFeeExemption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirmOperation.mockResolvedValue(true);
  });

  it('sums active sources without asking about them', async () => {
    const calculateAndConfirmFeeExemption = await importSubject();
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          {
            pubkey: VALID_PUBKEY_2,
            info: { balance: 33n * ETH, effectiveBalance: 32n * ETH },
          },
          {
            pubkey: VALID_PUBKEY_3,
            info: { balance: 33n * ETH, effectiveBalance: 32n * ETH },
          },
        ],
      },
    ]);

    const feeExemption = await calculateAndConfirmFeeExemption(map);

    // effective balance (32) is what moves, not the 33 ETH actual balance
    expect(feeExemption).toBe(64n * ETH);
    // only the final "Fee Exemption: … Continue?" confirmation
    expect(mockConfirmOperation).toHaveBeenCalledTimes(1);
  });

  it('excludes a slashed source without asking', async () => {
    const calculateAndConfirmFeeExemption = await importSubject();
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          {
            pubkey: VALID_PUBKEY_2,
            info: {
              status: 'active_slashed',
              slashed: true,
              balance: 32n * ETH,
              effectiveBalance: 32n * ETH,
            },
          },
        ],
      },
    ]);

    const feeExemption = await calculateAndConfirmFeeExemption(map);

    expect(feeExemption).toBe(0n);
    expect(mockConfirmOperation).toHaveBeenCalledTimes(1);
  });

  it('asks about a non-active source and counts it when confirmed', async () => {
    const calculateAndConfirmFeeExemption = await importSubject();
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          {
            pubkey: VALID_PUBKEY_2,
            info: {
              status: 'active_exiting',
              balance: 32n * ETH,
              effectiveBalance: 32n * ETH,
            },
          },
        ],
      },
    ]);

    const feeExemption = await calculateAndConfirmFeeExemption(map);

    expect(feeExemption).toBe(32n * ETH);
    expect(mockConfirmOperation).toHaveBeenCalledTimes(2);
    expect(mockConfirmOperation.mock.calls[0]?.[0]).toContain('active_exiting');
  });

  it('skips a non-active source when the operator declines', async () => {
    const calculateAndConfirmFeeExemption = await importSubject();
    mockConfirmOperation
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          {
            pubkey: VALID_PUBKEY_2,
            info: {
              status: 'active_exiting',
              balance: 32n * ETH,
              effectiveBalance: 32n * ETH,
            },
          },
        ],
      },
    ]);

    const feeExemption = await calculateAndConfirmFeeExemption(map);

    expect(feeExemption).toBe(0n);
  });

  it('throws when the operator rejects the calculated amount', async () => {
    const calculateAndConfirmFeeExemption = await importSubject();
    mockConfirmOperation.mockResolvedValue(false);
    const map = createTargetAndSourceMap([
      { target: VALID_PUBKEY_1, sources: [{ pubkey: VALID_PUBKEY_2 }] },
    ]);

    await expect(calculateAndConfirmFeeExemption(map)).rejects.toThrow(
      'User cancelled consolidation',
    );
  });
});
