import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConfirmOperation = vi.fn();
const mockCallReadMethodSilent = vi.fn();
const mockFindRecentFeeExemptions = vi.fn();
const mockLogCancel = vi.fn();

const DAY_SEC = 24n * 60n * 60n;
const HOUR_SEC = 60n * 60n;
const NOW_SEC = BigInt(Math.floor(Date.now() / 1000));

// real loggers: a stubbed printError would hide that it rethrows
vi.mock('utils', async () => {
  const logging = await vi.importActual<
    typeof import('utils/logging/console.js')
  >('../../utils/logging/console.js');
  const errorHandler = await vi.importActual<
    typeof import('utils/error-handler.js')
  >('../../utils/error-handler.js');

  return {
    ...logging,
    ...errorHandler,
    callReadMethodSilent: mockCallReadMethodSilent,
    confirmOperation: mockConfirmOperation,
    findRecentFeeExemptions: mockFindRecentFeeExemptions,
    formatFeeExemptionMatch: () => 'formatted-match',
    FEE_EXEMPTION_DUPLICATE_LOOKBACK_SEC: DAY_SEC,
    logCancel: mockLogCancel,
    showSpinner: () => () => {},
    callWriteMethodWithReceipt: vi.fn(),
    callWriteMethodWithReceiptBatchCalls: vi.fn(),
    flattenSourcePubkeys: vi.fn(),
    getSourceAndTargetPubkeysFromEncodedCall: vi.fn(),
    addDummyTargetAndSourceValidator: vi.fn(),
  };
});

vi.mock('providers', () => ({ getPublicClient: vi.fn() }));
vi.mock('contracts', () => ({
  getDashboardContract: vi.fn(),
  getValidatorConsolidationRequestsContract: vi.fn(),
}));
vi.mock('abi', () => ({ DashboardAbi: [] }));

const DASHBOARD_CONTRACT = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
} as any;

const FEE_EXEMPTION = 32_000_000_000_000_000_000n;

const importSubject = async () => {
  const { confirmFeeExemptionIncrease } =
    await import('../../features/consolidation.js');
  return confirmFeeExemptionIncrease;
};

const aMatch = {
  txHash: `0x${'ab'.repeat(32)}`,
  blockNumber: 1n,
  delta: FEE_EXEMPTION,
  timestamp: NOW_SEC,
};

describe('confirmFeeExemptionIncrease', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when there is no exemption to add', async () => {
    const confirmFeeExemptionIncrease = await importSubject();

    const result = await confirmFeeExemptionIncrease(DASHBOARD_CONTRACT, 0n);

    expect(result).toEqual({ shouldAddFeeExemption: false });
    expect(mockCallReadMethodSilent).not.toHaveBeenCalled();
    expect(mockConfirmOperation).not.toHaveBeenCalled();
  });

  it('adds the exemption without prompting when there are no recent corrections', async () => {
    mockCallReadMethodSilent.mockResolvedValue(0n);
    const confirmFeeExemptionIncrease = await importSubject();

    const result = await confirmFeeExemptionIncrease(
      DASHBOARD_CONTRACT,
      FEE_EXEMPTION,
    );

    expect(result).toEqual({ shouldAddFeeExemption: true });
    expect(mockFindRecentFeeExemptions).not.toHaveBeenCalled();
    expect(mockConfirmOperation).not.toHaveBeenCalled();
  });

  it('adds the exemption without prompting when no matching exemption is found', async () => {
    mockCallReadMethodSilent.mockResolvedValue(NOW_SEC - HOUR_SEC);
    mockFindRecentFeeExemptions.mockResolvedValue([]);
    const confirmFeeExemptionIncrease = await importSubject();

    const result = await confirmFeeExemptionIncrease(
      DASHBOARD_CONTRACT,
      FEE_EXEMPTION,
    );

    expect(result).toEqual({ shouldAddFeeExemption: true });
    expect(mockFindRecentFeeExemptions).toHaveBeenCalledWith(
      DASHBOARD_CONTRACT.address,
      FEE_EXEMPTION,
    );
    expect(mockConfirmOperation).not.toHaveBeenCalled();
  });

  // --yes / NODE_ENV=test auto-confirm every prompt, so the first one must mean "add"
  it('adds the exemption when prompts are auto-confirmed', async () => {
    mockCallReadMethodSilent.mockResolvedValue(NOW_SEC - HOUR_SEC);
    mockFindRecentFeeExemptions.mockResolvedValue([aMatch]);
    mockConfirmOperation.mockResolvedValue(true);
    const confirmFeeExemptionIncrease = await importSubject();

    const result = await confirmFeeExemptionIncrease(
      DASHBOARD_CONTRACT,
      FEE_EXEMPTION,
    );

    expect(result).toEqual({ shouldAddFeeExemption: true });
    expect(mockConfirmOperation).toHaveBeenCalledTimes(1);
  });

  it('skips only after an explicit decline and an explicit skip confirmation', async () => {
    mockCallReadMethodSilent.mockResolvedValue(NOW_SEC - HOUR_SEC);
    mockFindRecentFeeExemptions.mockResolvedValue([aMatch]);
    mockConfirmOperation
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const confirmFeeExemptionIncrease = await importSubject();

    const result = await confirmFeeExemptionIncrease(
      DASHBOARD_CONTRACT,
      FEE_EXEMPTION,
    );

    expect(result).toEqual({ shouldAddFeeExemption: false });
    expect(mockConfirmOperation).toHaveBeenCalledTimes(2);
  });

  it('cancels consolidation when the operator declines both prompts', async () => {
    mockCallReadMethodSilent.mockResolvedValue(NOW_SEC - HOUR_SEC);
    mockFindRecentFeeExemptions.mockResolvedValue([aMatch]);
    mockConfirmOperation.mockResolvedValue(false);
    const confirmFeeExemptionIncrease = await importSubject();

    await expect(
      confirmFeeExemptionIncrease(DASHBOARD_CONTRACT, FEE_EXEMPTION),
    ).rejects.toThrow('User cancelled consolidation');
    expect(mockLogCancel).toHaveBeenCalled();
  });

  // fails if fail-soft regresses into a hard abort
  it('falls back to an operator decision when the log scan fails', async () => {
    mockCallReadMethodSilent.mockResolvedValue(NOW_SEC - HOUR_SEC);
    mockFindRecentFeeExemptions.mockRejectedValue(new Error('range too wide'));
    mockConfirmOperation.mockResolvedValue(true);
    const confirmFeeExemptionIncrease = await importSubject();

    const result = await confirmFeeExemptionIncrease(
      DASHBOARD_CONTRACT,
      FEE_EXEMPTION,
    );

    expect(result).toEqual({ shouldAddFeeExemption: true });
    expect(mockConfirmOperation).toHaveBeenCalledTimes(1);
  });
});
