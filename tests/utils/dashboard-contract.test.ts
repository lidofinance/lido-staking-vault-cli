import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetPublicClient = vi.fn();
const mockGetVaultFactoryContract = vi.fn();

vi.mock('providers', () => ({
  getPublicClient: mockGetPublicClient,
}));

vi.mock('abi', () => ({
  DashboardAbi: [],
}));

vi.mock('../../contracts/vault-factory.js', () => ({
  getVaultFactoryContract: mockGetVaultFactoryContract,
}));

const importSubject = async () => {
  const { isDashboard } = await import('../../contracts/dashboard.js');
  return isDashboard;
};

const IMPL = `0x${'11'.repeat(20)}`;
const PROXY_CODE = `0x363d3d373d3d3d363d73${IMPL.slice(2)}5af43d82803e903d91602b57fd5bf`;

describe('isDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the deployed bytecode matches the Dashboard clone-proxy code', async () => {
    const isDashboard = await importSubject();

    mockGetVaultFactoryContract.mockResolvedValue({
      read: { DASHBOARD_IMPL: vi.fn().mockResolvedValue(IMPL) },
    });
    // the real clone-proxy runtime code ends with the STOP opcode (0x3)
    mockGetPublicClient.mockResolvedValue({
      getCode: vi.fn().mockResolvedValue(`${PROXY_CODE}3`),
    });

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(true);
  });

  it('returns false when the deployed bytecode does not start with the proxy code', async () => {
    const isDashboard = await importSubject();

    mockGetVaultFactoryContract.mockResolvedValue({
      read: { DASHBOARD_IMPL: vi.fn().mockResolvedValue(IMPL) },
    });
    mockGetPublicClient.mockResolvedValue({
      getCode: vi.fn().mockResolvedValue('0xdeadbeef'),
    });

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(false);
  });

  it('returns false when the address has no deployed bytecode (EOA)', async () => {
    const isDashboard = await importSubject();

    mockGetVaultFactoryContract.mockResolvedValue({
      read: { DASHBOARD_IMPL: vi.fn().mockResolvedValue(IMPL) },
    });
    mockGetPublicClient.mockResolvedValue({
      getCode: vi.fn(),
    });

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(false);
  });
});
