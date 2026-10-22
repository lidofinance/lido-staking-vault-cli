import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetPublicClient = vi.fn();
const mockGetVaultFactoryContract = vi.fn();
const mockGetDashboardImplAddresses = vi.fn();

vi.mock('providers', () => ({
  getPublicClient: mockGetPublicClient,
}));

vi.mock('configs', () => ({
  getDashboardImplAddresses: mockGetDashboardImplAddresses,
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
const PREVIOUS_IMPL = `0x${'22'.repeat(20)}`;
const UNKNOWN_IMPL = `0x${'33'.repeat(20)}`;
const VAULT_ARG = '00'.repeat(12) + 'bb'.repeat(20);
const cloneCode = (impl: string) =>
  `0x363d3d373d3d3d363d73${impl.slice(2)}5af43d82803e903d91602b57fd5bf3${VAULT_ARG}`;

const mockCode = (code?: string) =>
  mockGetPublicClient.mockResolvedValue({
    getCode: vi.fn().mockResolvedValue(code),
  });

describe('isDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // the impl list is cached per module
    vi.resetModules();

    mockGetVaultFactoryContract.mockResolvedValue({
      read: { DASHBOARD_IMPL: vi.fn().mockResolvedValue(IMPL) },
    });
    mockGetDashboardImplAddresses.mockReturnValue([IMPL, PREVIOUS_IMPL]);
  });

  it('returns true for a clone of the current factory impl', async () => {
    const isDashboard = await importSubject();
    mockCode(cloneCode(IMPL));

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(true);
  });

  it('returns true for a clone of a previous impl', async () => {
    const isDashboard = await importSubject();
    mockCode(cloneCode(PREVIOUS_IMPL));

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(true);
  });

  it('returns false for a clone of an unknown impl', async () => {
    const isDashboard = await importSubject();
    mockCode(cloneCode(UNKNOWN_IMPL));

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(false);
  });

  it('returns false when the deployed bytecode does not start with the proxy code', async () => {
    const isDashboard = await importSubject();
    mockCode('0xdeadbeef');

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(false);
  });

  it('returns false when the address has no deployed bytecode (EOA)', async () => {
    const isDashboard = await importSubject();
    mockCode();

    await expect(isDashboard(`0x${'aa'.repeat(20)}`)).resolves.toBe(false);
  });

  it('reads DASHBOARD_IMPL once across calls', async () => {
    const isDashboard = await importSubject();
    const readImpl = vi.fn().mockResolvedValue(IMPL);
    mockGetVaultFactoryContract.mockResolvedValue({
      read: { DASHBOARD_IMPL: readImpl },
    });
    mockCode(cloneCode(IMPL));

    await isDashboard(`0x${'aa'.repeat(20)}`);
    await isDashboard(`0x${'aa'.repeat(20)}`);

    expect(readImpl).toHaveBeenCalledTimes(1);
  });
});
