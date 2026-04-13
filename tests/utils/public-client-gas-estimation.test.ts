import { describe, it, expect, vi, beforeEach } from 'vitest';
import { maxUint256 } from 'viem';

const MOCK_ACCOUNT_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
const MOCK_CHAIN = { id: 560048, name: 'hoodi' };
const MOCK_EL_URL = 'http://localhost:8545';

// Track calls to the real estimateGas
const mockEstimateGas = vi.fn();

vi.mock('viem/actions', () => ({
  estimateGas: (...args: unknown[]) => mockEstimateGas(...args),
}));

vi.mock('viem', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    createPublicClient: () => {
      const base = {
        chain: MOCK_CHAIN,
        extend: (fn: (client: unknown) => Record<string, unknown>) => {
          const extensions = fn(base);
          for (const key in base) delete (extensions as any)[key];
          return { ...base, ...extensions };
        },
      };
      return base;
    },
  };
});

vi.mock('command', () => ({
  program: { opts: () => ({}) },
}));

vi.mock('../../configs/index.js', () => ({
  getConfig: () => ({
    PRIVATE_KEY:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  }),
  getChainId: async () => 560048,
  getElUrl: () => MOCK_EL_URL,
  getChain: async () => MOCK_CHAIN,
  envs: {},
}));

vi.mock('../../utils/index.js', () => ({
  createWalletConnectClient: vi.fn(),
}));

vi.mock('ox', () => ({
  Keystore: {},
}));

describe('getPublicClient gas estimation override', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should inject stateOverride with maxUint256 balance into estimateGas', async () => {
    mockEstimateGas.mockResolvedValue(150000n);

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const args = {
      to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const,
      data: '0x1234' as const,
      account: { address: MOCK_ACCOUNT_ADDRESS, type: 'local' as const },
    };

    const result = await (client as any).estimateGas(args);

    expect(result).toBe(150000n);
    expect(mockEstimateGas).toHaveBeenCalledTimes(1);

    const callArgs = mockEstimateGas.mock.calls[0]?.[1];
    expect(callArgs.stateOverride).toEqual(
      expect.arrayContaining([
        { address: MOCK_ACCOUNT_ADDRESS, balance: maxUint256 },
      ]),
    );
  });

  it('should preserve existing stateOverride entries', async () => {
    mockEstimateGas.mockResolvedValue(200000n);

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const existingOverride = {
      address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' as const,
      balance: 999n,
    };

    const args = {
      to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const,
      data: '0x1234' as const,
      account: { address: MOCK_ACCOUNT_ADDRESS, type: 'local' as const },
      stateOverride: [existingOverride],
    };

    await (client as any).estimateGas(args);

    const callArgs = mockEstimateGas.mock.calls[0]?.[1];
    expect(callArgs.stateOverride).toHaveLength(2);
    expect(callArgs.stateOverride[0]).toEqual(existingOverride);
    expect(callArgs.stateOverride[1]).toEqual({
      address: MOCK_ACCOUNT_ADDRESS,
      balance: maxUint256,
    });
  });

  it('should fall back to default estimateGas when stateOverride is unsupported', async () => {
    mockEstimateGas
      .mockRejectedValueOnce(new Error('invalid argument 2: stateOverride'))
      .mockResolvedValueOnce(100000n);

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const args = {
      to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const,
      data: '0x1234' as const,
      account: { address: MOCK_ACCOUNT_ADDRESS, type: 'local' as const },
    };

    const result = await (client as any).estimateGas(args);

    expect(result).toBe(100000n);
    expect(mockEstimateGas).toHaveBeenCalledTimes(2);

    // Second call should NOT have stateOverride
    const fallbackArgs = mockEstimateGas.mock.calls[1]?.[1];
    expect(fallbackArgs.stateOverride).toBeUndefined();
  });

  it('should fall back when RPC returns "too many arguments"', async () => {
    mockEstimateGas
      .mockRejectedValueOnce(new Error('too many arguments, want at most 2'))
      .mockResolvedValueOnce(100000n);

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const args = {
      to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const,
      data: '0x1234' as const,
      account: { address: MOCK_ACCOUNT_ADDRESS, type: 'local' as const },
    };

    const result = await (client as any).estimateGas(args);

    expect(result).toBe(100000n);
    expect(mockEstimateGas).toHaveBeenCalledTimes(2);
  });

  it('should re-throw real contract errors (not swallow them)', async () => {
    const revertError = new Error(
      'execution reverted: ERC20: transfer amount exceeds balance',
    );
    mockEstimateGas.mockRejectedValue(revertError);

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const args = {
      to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const,
      data: '0x1234' as const,
      account: { address: MOCK_ACCOUNT_ADDRESS, type: 'local' as const },
    };

    await expect((client as any).estimateGas(args)).rejects.toThrow(
      'execution reverted',
    );

    // Should NOT retry — only 1 call
    expect(mockEstimateGas).toHaveBeenCalledTimes(1);
  });

  it('should skip override when no account is provided', async () => {
    mockEstimateGas.mockResolvedValue(21000n);

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const args = {
      to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const,
      value: 0n,
      // no account
    };

    const result = await (client as any).estimateGas(args);

    expect(result).toBe(21000n);
    expect(mockEstimateGas).toHaveBeenCalledTimes(1);

    // Should call without stateOverride since no account
    const callArgs = mockEstimateGas.mock.calls[0]?.[1];
    expect(callArgs.stateOverride).toBeUndefined();
  });

  it('should handle string account address', async () => {
    mockEstimateGas.mockResolvedValue(150000n);

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const differentAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    const args = {
      to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as const,
      data: '0x1234' as const,
      account: differentAddress,
    };

    await (client as any).estimateGas(args);

    const callArgs = mockEstimateGas.mock.calls[0]?.[1];
    expect(callArgs.stateOverride).toEqual([
      { address: differentAddress, balance: maxUint256 },
    ]);
  });
});
