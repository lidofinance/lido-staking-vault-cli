import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Address } from 'viem';

const mockIsDashboard = vi.fn();
const mockIsDashboardBelongsToVault = vi.fn();
const mockGetDashboardContract = vi.fn();
const mockConfirmPrompt = vi.fn();
const mockConfirmOperation = vi.fn();
const mockLogInfo = vi.fn();
const mockIsJsonMode = vi.fn();
const mockIsAutoConfirmEnvironment = vi.fn();
const mockOpts = vi.fn();

vi.mock('contracts', () => ({
  isDashboard: mockIsDashboard,
  isDashboardBelongsToVault: mockIsDashboardBelongsToVault,
  getDashboardContract: mockGetDashboardContract,
}));

vi.mock('utils', () => ({
  confirmPrompt: mockConfirmPrompt,
  confirmOperation: mockConfirmOperation,
  isAutoConfirmEnvironment: mockIsAutoConfirmEnvironment,
  isJsonMode: mockIsJsonMode,
  logInfo: mockLogInfo,
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
  'Do you want to verify that the Dashboard belongs to the stVault?';
const IS_DASHBOARD_MESSAGE =
  'Do you want to verify that this address is a Dashboard contract?';

describe('verifyDashboardAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpts.mockReturnValue({ yes: false });
    mockIsJsonMode.mockReturnValue(false);
    mockIsAutoConfirmEnvironment.mockReturnValue(true);
    mockConfirmOperation.mockResolvedValue(true);
  });

  it('throws on a failed check with --yes instead of auto-proceeding', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockOpts.mockReturnValue({ yes: true });
    mockIsDashboard.mockResolvedValue(false);

    await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow(
      '--skip-dashboard-check',
    );
    expect(mockConfirmOperation).not.toHaveBeenCalled();
  });

  it('proceeds on a failed check with --skip-dashboard-check', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockOpts.mockReturnValue({ yes: true, skipDashboardCheck: true });
    mockIsDashboard.mockResolvedValue(true);
    mockIsDashboardBelongsToVault.mockResolvedValue(false);

    await expect(
      verifyDashboardAddress(ADDRESS, VAULT),
    ).resolves.toBeUndefined();
    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.stringContaining('does not belong to vault'),
    );
    expect(mockConfirmOperation).not.toHaveBeenCalled();
  });

  it('passes when the address is a Dashboard and no vault is supplied', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(true);

    await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();

    expect(mockIsDashboard).toHaveBeenCalledWith(ADDRESS);
    expect(mockIsDashboardBelongsToVault).not.toHaveBeenCalled();
    expect(mockConfirmOperation).not.toHaveBeenCalled();
  });

  it('warns and continues when the address is not a Dashboard and the user proceeds', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(false);

    await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();

    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.stringContaining('is not a Dashboard contract'),
    );
    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.stringContaining('managed by a contract other than the Dashboard'),
    );
    expect(mockConfirmOperation).toHaveBeenCalledWith(
      'Do you want to proceed?',
    );
    expect(mockIsDashboardBelongsToVault).not.toHaveBeenCalled();
  });

  it('throws when the address is not a Dashboard and the user exits', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(false);
    mockConfirmOperation.mockResolvedValue(false);

    await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow(
      'is not a Dashboard contract',
    );
    expect(mockIsDashboardBelongsToVault).not.toHaveBeenCalled();
  });

  it('warns and continues when the Dashboard does not belong to the vault and the user proceeds', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(true);
    mockIsDashboardBelongsToVault.mockResolvedValue(false);

    await expect(
      verifyDashboardAddress(ADDRESS, VAULT),
    ).resolves.toBeUndefined();

    expect(mockLogInfo).toHaveBeenCalledWith(
      expect.stringContaining('does not belong to vault'),
    );
    expect(mockConfirmOperation).toHaveBeenCalledWith(
      'Do you want to proceed?',
    );
  });

  it('throws when the Dashboard does not belong to the vault and the user exits', async () => {
    const { verifyDashboardAddress } = await importSubject();
    mockIsDashboard.mockResolvedValue(true);
    mockIsDashboardBelongsToVault.mockResolvedValue(false);
    mockConfirmOperation.mockResolvedValue(false);

    await expect(verifyDashboardAddress(ADDRESS, VAULT)).rejects.toThrow(
      'does not belong to vault',
    );
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
      mockIsAutoConfirmEnvironment.mockReturnValue(false);
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
      expect(mockLogInfo).toHaveBeenCalledWith(
        '⚠️  Dashboard address check skipped.',
      );
    });

    it('cancels the command when the prompt is aborted', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockConfirmPrompt.mockResolvedValue({});

      await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow(
        'Command cancelled',
      );
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

  describe('in --json mode', () => {
    beforeEach(() => {
      mockIsAutoConfirmEnvironment.mockReturnValue(false);
      mockOpts.mockReturnValue({ yes: false, skipDashboardCheck: false });
      mockIsJsonMode.mockReturnValue(true);
    });

    it('runs the check without prompting', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockIsDashboard.mockResolvedValue(true);

      await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();

      expect(mockConfirmPrompt).not.toHaveBeenCalled();
      expect(mockIsDashboard).toHaveBeenCalledWith(ADDRESS);
    });

    it('fails closed on a failed check without --skip-dashboard-check', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockIsDashboard.mockResolvedValue(false);

      await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow(
        '--skip-dashboard-check',
      );
      expect(mockConfirmOperation).not.toHaveBeenCalled();
    });

    it('proceeds on a failed check with --skip-dashboard-check', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockOpts.mockReturnValue({ yes: false, skipDashboardCheck: true });
      mockIsDashboard.mockResolvedValue(false);

      await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();
      expect(mockConfirmOperation).not.toHaveBeenCalled();
    });

    it('fails closed on a rejected read without --skip-dashboard-check', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockIsDashboard.mockRejectedValue(new Error('RPC down'));

      await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow(
        '--skip-dashboard-check',
      );
      expect(mockConfirmOperation).not.toHaveBeenCalled();
    });
  });

  describe('when verification reads reject', () => {
    it('proceeds on a rejected isDashboard read with --skip-dashboard-check', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockOpts.mockReturnValue({ yes: false, skipDashboardCheck: true });
      mockIsDashboard.mockRejectedValue(new Error('RPC down'));

      await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();
      expect(mockLogInfo).toHaveBeenCalledWith(
        expect.stringContaining('Failed to verify whether'),
      );
      expect(mockConfirmOperation).not.toHaveBeenCalled();
    });

    it('fails closed on a rejected isDashboard read with --yes', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockOpts.mockReturnValue({ yes: true, skipDashboardCheck: false });
      mockIsDashboard.mockRejectedValue(new Error('RPC down'));

      await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow(
        '--skip-dashboard-check',
      );
    });

    it('proceeds interactively on a rejected isDashboard read', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockIsDashboard.mockRejectedValue(new Error('RPC down'));

      await expect(verifyDashboardAddress(ADDRESS)).resolves.toBeUndefined();
      expect(mockConfirmOperation).toHaveBeenCalledWith(
        'Do you want to proceed?',
      );
    });

    it('exits on a rejected isDashboard read when the user declines', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockIsDashboard.mockRejectedValue(new Error('RPC down'));
      mockConfirmOperation.mockResolvedValue(false);

      await expect(verifyDashboardAddress(ADDRESS)).rejects.toThrow('RPC down');
    });

    it('routes a rejected isDashboardBelongsToVault read through the override', async () => {
      const { verifyDashboardAddress } = await importSubject();
      mockIsDashboard.mockResolvedValue(true);
      mockIsDashboardBelongsToVault.mockRejectedValue(new Error('RPC down'));
      mockOpts.mockReturnValue({ yes: false, skipDashboardCheck: true });

      await expect(
        verifyDashboardAddress(ADDRESS, VAULT),
      ).resolves.toBeUndefined();
      expect(mockLogInfo).toHaveBeenCalledWith(
        expect.stringContaining('Failed to verify whether Dashboard'),
      );
    });
  });
});

describe('getDashboardContractChecked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpts.mockReturnValue({ yes: false });
    mockIsJsonMode.mockReturnValue(false);
    mockIsAutoConfirmEnvironment.mockReturnValue(true);
    mockConfirmOperation.mockResolvedValue(true);
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
