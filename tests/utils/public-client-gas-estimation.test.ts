import { describe, it, expect, vi, beforeEach } from 'vitest';

const MAX_UINT256_HEX =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const MOCK_CHAIN = { id: 560048, name: 'hoodi' };
const MOCK_EL_URL = 'http://localhost:8545';
const MOCK_FROM = '0x1234567890abcdef1234567890abcdef12345678';

// Represents the raw RPC handler underneath the balanceAwareTransport wrapper
const mockRpcRequest = vi.fn();

vi.mock('viem', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    // Return a minimal transport factory whose `request` we control
    http: () => {
      const factory = Object.assign(
        () => ({ request: mockRpcRequest }),
        { config: { key: 'http' }, value: undefined },
      );
      return factory;
    },
    // Expose the transport's wrapped `request` directly on the client
    createPublicClient: ({ transport }: any) => {
      const instance = transport({ chain: MOCK_CHAIN });
      return { chain: MOCK_CHAIN, request: instance.request };
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

/**
 * Tests for balanceAwareTransport — the transport-level wrapper that injects
 * stateOverride into every eth_estimateGas RPC call to bypass the node's
 * balance pre-check.
 *
 * We mock viem's http() transport so that `base.request` is our mockRpcRequest,
 * then call the wrapped `request` directly to verify interception logic.
 *
 * vi.resetModules() in beforeEach ensures each test gets a fresh module with
 * a clean nodeSupportsStateOverride cache.
 */
describe('balanceAwareTransport (transport-level gas estimation fix)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('injects stateOverride with max balance into eth_estimateGas', async () => {
    mockRpcRequest.mockResolvedValue('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xdead', data: '0x1234' }],
    });

    expect(mockRpcRequest).toHaveBeenCalledTimes(1);
    const rpcCall = mockRpcRequest.mock.calls[0]![0];
    expect(rpcCall.method).toBe('eth_estimateGas');
    expect(rpcCall.params).toHaveLength(3);
    expect(rpcCall.params[0]).toEqual({
      from: MOCK_FROM,
      to: '0xdead',
      data: '0x1234',
    });
    expect(rpcCall.params[1]).toBe('latest');
    expect(rpcCall.params[2]).toEqual({
      [MOCK_FROM]: { balance: MAX_UINT256_HEX },
    });
  });

  it('preserves existing stateOverride entries and custom blockTag', async () => {
    mockRpcRequest.mockResolvedValue('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const existing = {
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa': { balance: '0x3e7' },
    };

    await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xdead' }, 'pending', existing],
    });

    const rpcCall = mockRpcRequest.mock.calls[0]![0];
    expect(rpcCall.params[1]).toBe('pending');
    expect(rpcCall.params[2]).toEqual({
      ...existing,
      [MOCK_FROM]: { balance: MAX_UINT256_HEX },
    });
  });

  it('falls back when RPC rejects stateOverride', async () => {
    mockRpcRequest
      .mockRejectedValueOnce(new Error('invalid argument 2: stateOverride'))
      .mockResolvedValueOnce('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const result = await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xdead' }],
    });

    expect(result).toBe('0x5208');
    expect(mockRpcRequest).toHaveBeenCalledTimes(2);

    // Second call: original args without stateOverride
    const fallbackCall = mockRpcRequest.mock.calls[1]![0];
    expect(fallbackCall.params).toHaveLength(1);
  });

  it('falls back on "too many arguments"', async () => {
    mockRpcRequest
      .mockRejectedValueOnce(new Error('too many arguments, want at most 2'))
      .mockResolvedValueOnce('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const result = await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xdead' }],
    });

    expect(result).toBe('0x5208');
    expect(mockRpcRequest).toHaveBeenCalledTimes(2);
  });

  it('falls back on "invalid argument"', async () => {
    mockRpcRequest
      .mockRejectedValueOnce(new Error('invalid argument'))
      .mockResolvedValueOnce('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    const result = await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xdead' }],
    });

    expect(result).toBe('0x5208');
    expect(mockRpcRequest).toHaveBeenCalledTimes(2);
  });

  it('re-throws real contract errors (not swallowed)', async () => {
    mockRpcRequest.mockRejectedValue(
      new Error('execution reverted: ERC20: transfer amount exceeds balance'),
    );

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    await expect(
      (client as any).request({
        method: 'eth_estimateGas',
        params: [{ from: MOCK_FROM, to: '0xdead' }],
      }),
    ).rejects.toThrow('execution reverted');

    // Should NOT retry — only 1 call
    expect(mockRpcRequest).toHaveBeenCalledTimes(1);
  });

  it('skips override when no from address in params', async () => {
    mockRpcRequest.mockResolvedValue('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ to: '0xdead', data: '0x1234' }],
    });

    expect(mockRpcRequest).toHaveBeenCalledTimes(1);
    // Passed through unchanged — no stateOverride injected
    const rpcCall = mockRpcRequest.mock.calls[0]![0];
    expect(rpcCall).toEqual({
      method: 'eth_estimateGas',
      params: [{ to: '0xdead', data: '0x1234' }],
    });
  });

  it('passes non-estimateGas calls through unchanged', async () => {
    mockRpcRequest.mockResolvedValue('0x1');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    await (client as any).request({
      method: 'eth_blockNumber',
      params: [],
    });

    expect(mockRpcRequest).toHaveBeenCalledTimes(1);
    expect(mockRpcRequest.mock.calls[0]![0]).toEqual({
      method: 'eth_blockNumber',
      params: [],
    });
  });

  it('caches stateOverride support after first successful call', async () => {
    mockRpcRequest.mockResolvedValue('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    // First call — probes stateOverride support
    await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xdead' }],
    });

    // Second call — should still inject stateOverride (cached: supported)
    await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xbeef' }],
    });

    expect(mockRpcRequest).toHaveBeenCalledTimes(2);
    // Both calls include stateOverride (3 params each)
    expect(mockRpcRequest.mock.calls[0]![0].params).toHaveLength(3);
    expect(mockRpcRequest.mock.calls[1]![0].params).toHaveLength(3);
  });

  it('skips stateOverride on subsequent calls after fallback (cached: unsupported)', async () => {
    // First call: stateOverride fails → fallback
    mockRpcRequest
      .mockRejectedValueOnce(new Error('too many arguments, want at most 2'))
      .mockResolvedValueOnce('0x5208');

    const { getPublicClient } = await import('../../providers/wallet.js');
    const client = await getPublicClient();

    await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xdead' }],
    });

    expect(mockRpcRequest).toHaveBeenCalledTimes(2); // try + fallback

    // Second call: should go directly to original (no stateOverride attempt)
    mockRpcRequest.mockResolvedValueOnce('0x7530');
    await (client as any).request({
      method: 'eth_estimateGas',
      params: [{ from: MOCK_FROM, to: '0xbeef' }],
    });

    expect(mockRpcRequest).toHaveBeenCalledTimes(3); // 2 from first + 1 direct
    // Third RPC call: original args, no stateOverride
    const directCall = mockRpcRequest.mock.calls[2]![0];
    expect(directCall.params).toHaveLength(1);
    expect(directCall.params[0]).toEqual({ from: MOCK_FROM, to: '0xbeef' });
  });
});
