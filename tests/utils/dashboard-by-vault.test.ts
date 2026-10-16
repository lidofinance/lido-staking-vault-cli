import { describe, it, expect, vi, beforeEach } from 'vitest';
import { zeroAddress } from 'viem';
import type { Address } from 'viem';

const mockCheckIsDisconnected = vi.fn();
const mockConfirmOperation = vi.fn();
const mockCallReadMethodSilent = vi.fn();
const mockIsDashboard = vi.fn();
const mockGetVaultHubContract = vi.fn();
const mockGetStakingVaultContract = vi.fn();
const mockVerifyDashboardAddress = vi.fn();
const mockGetCode = vi.fn();

vi.mock('features', () => ({
  checkIsDisconnected: mockCheckIsDisconnected,
}));

vi.mock('contracts', () => ({
  getVaultHubContract: mockGetVaultHubContract,
  getStakingVaultContract: mockGetStakingVaultContract,
  isDashboard: mockIsDashboard,
}));

vi.mock('providers', () => ({
  getPublicClient: async () => ({ getCode: mockGetCode }),
}));

vi.mock('utils', () => ({
  callReadMethodSilent: mockCallReadMethodSilent,
  confirmOperation: mockConfirmOperation,
  enterContractAddress: vi.fn(),
}));

vi.mock('../../features/vault-operations/dashboard-address-check.js', () => ({
  verifyDashboardAddress: mockVerifyDashboardAddress,
}));

vi.mock('../../features/vault-operations/vaults-by-role.js', () => ({
  chooseVault: vi.fn(),
}));

const importSubject = async () => {
  const { getDashboardByVault } =
    await import('../../features/vault-operations/dashboard-by-vault.js');
  return getDashboardByVault;
};

const VAULT: Address = `0x${'01'.repeat(20)}`;
const DASHBOARD: Address = `0x${'02'.repeat(20)}`;
const VAULT_HUB: Address = `0x${'03'.repeat(20)}`;
const NEW_OWNER: Address = `0x${'04'.repeat(20)}`;
const NOT_DASHBOARD: Address = `0x${'05'.repeat(20)}`;

interface State {
  isDisconnected: boolean;
  confirmOperationResult: boolean;
  vaultConnection: { owner: Address; vaultIndex: bigint };
  owner: Address;
  pendingOwner: Address;
  isDashboardResults: Record<string, boolean>;
  eoas: Address[];
}

let state: State;

const readMethodNames = () =>
  mockCallReadMethodSilent.mock.calls.map(
    (call) => (call[0] as any).methodName,
  );

describe('getDashboardByVault', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    state = {
      isDisconnected: false,
      confirmOperationResult: true,
      vaultConnection: { owner: DASHBOARD, vaultIndex: 1n },
      owner: VAULT_HUB,
      pendingOwner: zeroAddress,
      isDashboardResults: { [DASHBOARD.toLowerCase()]: true },
      eoas: [],
    };

    mockCheckIsDisconnected.mockImplementation(
      async () => state.isDisconnected,
    );
    mockConfirmOperation.mockImplementation(
      async () => state.confirmOperationResult,
    );
    mockCallReadMethodSilent.mockImplementation(
      async ({ methodName }: { methodName: string }) => {
        if (methodName === 'vaultConnection') {
          return state.vaultConnection;
        }
        if (methodName === 'owner') {
          return state.owner;
        }
        if (methodName === 'pendingOwner') {
          return state.pendingOwner;
        }
        throw new Error(`unexpected methodName: ${methodName}`);
      },
    );
    mockIsDashboard.mockImplementation(
      async (address: Address) =>
        state.isDashboardResults[address.toLowerCase()] ?? false,
    );
    mockGetCode.mockImplementation(async ({ address }: { address: Address }) =>
      state.eoas.includes(address) ? undefined : '0x6080',
    );
    mockGetVaultHubContract.mockResolvedValue({ address: VAULT_HUB });
    mockGetStakingVaultContract.mockResolvedValue({});
  });

  it('resolves the Dashboard from VaultHub when the vault is connected', async () => {
    const getDashboardByVault = await importSubject();

    await expect(getDashboardByVault(VAULT)).resolves.toBe(DASHBOARD);

    expect(mockConfirmOperation).not.toHaveBeenCalled();
    expect(mockVerifyDashboardAddress).toHaveBeenCalledWith(DASHBOARD, VAULT);
    expect(readMethodNames()).not.toContain('pendingOwner');
  });

  it('resolves the Dashboard as the vault owner after disconnect or abandonDashboard', async () => {
    const getDashboardByVault = await importSubject();

    state.isDisconnected = true;
    state.vaultConnection = { owner: zeroAddress, vaultIndex: 0n };
    state.owner = DASHBOARD;
    state.pendingOwner = NEW_OWNER;

    await expect(getDashboardByVault(VAULT)).resolves.toBe(DASHBOARD);

    // owner() is already the Dashboard, so the pending-owner branch must not fire
    expect(readMethodNames()).not.toContain('pendingOwner');
    expect(mockVerifyDashboardAddress).toHaveBeenCalledWith(DASHBOARD, VAULT);
  });

  it('resolves the pending owner as the Dashboard during the post-disconnect transfer', async () => {
    const getDashboardByVault = await importSubject();

    state.isDisconnected = true;
    state.vaultConnection = { owner: zeroAddress, vaultIndex: 0n };
    state.owner = VAULT_HUB;
    state.pendingOwner = DASHBOARD;
    state.isDashboardResults = {
      [VAULT_HUB.toLowerCase()]: false,
      [DASHBOARD.toLowerCase()]: true,
    };

    await expect(getDashboardByVault(VAULT)).resolves.toBe(DASHBOARD);

    expect(readMethodNames()).toContain('pendingOwner');
    expect(mockVerifyDashboardAddress).toHaveBeenCalledWith(DASHBOARD, VAULT);
  });

  it('resolves and verifies the supposed address when connected but the owner is not a Dashboard', async () => {
    const getDashboardByVault = await importSubject();

    state.vaultConnection = { owner: NOT_DASHBOARD, vaultIndex: 1n };
    state.isDashboardResults = { [NOT_DASHBOARD.toLowerCase()]: false };

    await expect(getDashboardByVault(VAULT)).resolves.toBe(NOT_DASHBOARD);
    expect(mockVerifyDashboardAddress).toHaveBeenCalledWith(
      NOT_DASHBOARD,
      VAULT,
    );
  });

  it('throws when the vault is held by VaultHub without a pending Dashboard', async () => {
    const getDashboardByVault = await importSubject();

    state.isDisconnected = true;
    state.vaultConnection = { owner: zeroAddress, vaultIndex: 0n };
    state.owner = VAULT_HUB;
    state.pendingOwner = zeroAddress;

    await expect(getDashboardByVault(VAULT)).rejects.toThrow(
      'is held by VaultHub',
    );
    expect(mockVerifyDashboardAddress).not.toHaveBeenCalled();
  });

  it('throws when the resolved owner is an EOA', async () => {
    const getDashboardByVault = await importSubject();

    state.isDisconnected = true;
    state.vaultConnection = { owner: zeroAddress, vaultIndex: 0n };
    state.owner = NEW_OWNER;
    state.eoas = [NEW_OWNER];

    await expect(getDashboardByVault(VAULT)).rejects.toThrow(
      'is not a contract (probably EOA)',
    );
    expect(mockVerifyDashboardAddress).not.toHaveBeenCalled();
  });

  it('throws when the vault is disconnected and the operator declines to continue', async () => {
    const getDashboardByVault = await importSubject();

    state.isDisconnected = true;
    state.confirmOperationResult = false;

    await expect(getDashboardByVault(VAULT)).rejects.toThrow(
      'Vault is not connected to VaultHub',
    );
    expect(mockCallReadMethodSilent).not.toHaveBeenCalled();
  });
});
