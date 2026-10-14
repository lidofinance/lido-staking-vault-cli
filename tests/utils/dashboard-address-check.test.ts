import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Address } from 'viem';

const mockIsDashboard = vi.fn();
const mockIsDashboardBelongsToVault = vi.fn();
const mockGetDashboardContract = vi.fn();
const mockConfirmPrompt = vi.fn();
const mockOpts = vi.fn();

vi.mock('contracts', () => ({
  isDashboard: mockIsDashboard,
  isDashboardBelongsToVault: mockIsDashboardBelongsToVault,
  getDashboardContract: mockGetDashboardContract,
}));

vi.mock('utils', () => ({
  confirmPrompt: mockConfirmPrompt,
}));

vi.mock('command', () => ({
  program: { opts: mockOpts },
}));

const importSubject = async () => {
  const { verifyDashboardAddress, getDashboardContractChecked } =
    await import('../../features/vault-operations/dashboard-address-check.js');
  return { verifyDashboardAddress, getDashboardContractChecked };
};

const ADDRESS: Address = `0x${'aa'.repeat(20)}`;
const VAULT: Address = `0x${'bb'.repeat(20)}`;

const BELONGS_TO_VAULT_MESSAGE =
  'Do you want to check Dashboard address that is belonging to stVault?';
const IS_DASHBOARD_MESSAGE =
  'Do you want to check that this address is a Dashboard contract?';

describe('verifyDashboardAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpts.mockReturnValue({ yes: false });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes when the address is a Dashboard and no vault is supplied', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(true);

    await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();

    expect(mockIsDashboard).toHaveBeenCalledWith(ADDRESS);
    expect(mockIsDashboardBelongsToVault).not.toHaveBeenCalled();
  });

  it('throws when the address is not a Dashboard', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(false);

    await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow(
      'is not a Dashboard contract',
    );
    expect(mockIsDashboardBelongsToVault).not.toHaveBeenCalled();
  });

  it('throws when the Dashboard does not belong to the vault', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(true);
    mockIsDashboardBelongsToVault.mockResolvedValue(false);

    await expect(verifyDashboardAddress(ADDRESS, VAULT)).rejects.toThrow(
      'does not belong to vault',
    );
    expect(mockIsDashboardBelongsToVault).toHaveBeenCalledWith(VAULT, ADDRESS);
  });

  it('passes when the Dashboard belongs to the vault', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(true);
    mockIsDashboardBelongsToVault.mockResolvedValue(true);

    await expect(
      verifyDashboardAddress(ADDRESS, VAULT),
    ).resolves.toBeUndefined();
  });

  describe('when the check is prompted (not auto-confirmed)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('VITEST', 'false');
      mockOpts.mockReturnValue({ yes: false });
    });

    it('defaults the prompt to true and runs the check', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockConfirmPrompt.mockResolvedValue({ confirm: true });
      mockIsDashboard.mockResolvedValue(true);

      await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();

      expect(mockConfirmPrompt).toHaveBeenCalledWith(
        IS_DASHBOARD_MESSAGE,
        'confirm',
        true,
      );
      expect(mockIsDashboard).toHaveBeenCalledWith(ADDRESS);
    });

    it('uses the vault-aware message when a vault is supplied', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockConfirmPrompt.mockResolvedValue({ confirm: true });
      mockIsDashboard.mockResolvedValue(true);
      mockIsDashboardBelongsToVault.mockResolvedValue(true);

      await expect(
        verifyDashboardAddress(ADDRESS, VAULT),
      ).resolves.toBeUndefined();

      expect(mockConfirmPrompt).toHaveBeenCalledWith(
        BELONGS_TO_VAULT_MESSAGE,
        'confirm',
        true,
      );
    });

    it('skips the check when the user declines', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockConfirmPrompt.mockResolvedValue({ confirm: false });

      await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();

      expect(mockIsDashboard).not.toHaveBeenCalled();
    });

    it('runs the check without prompting when --yes is set', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockOpts.mockReturnValue({ yes: true });
      mockIsDashboard.mockResolvedValue(true);

      await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();

      expect(mockConfirmPrompt).not.toHaveBeenCalled();
      expect(mockIsDashboard).toHaveBeenCalledWith(ADDRESS);
    });
  });
});

describe('getDashboardContractChecked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpts.mockReturnValue({ yes: false });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('verifies the address and returns the contract', async () => {
    const { getDashboardContractChecked } = await importSubject();
    const contract = { address: ADDRESS };
    mockIsDashboard.mockResolvedValue(true);
    mockGetDashboardContract.mockResolvedValue(contract);

    await expect(getDashboardContractChecked(ADDRESS)).resolves.toBe(contract);

    expect(mockIsDashboard).toHaveBeenCalledWith(ADDRESS);
    expect(mockGetDashboardContract).toHaveBeenCalledWith(ADDRESS);
  });
});
