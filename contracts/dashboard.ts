import { getContract, Address, GetContractReturnType, Hex } from 'viem';
import { DashboardAbi } from 'abi';
import { getPublicClient, RegisteredPublicClient } from 'providers';
import { getDashboardImplAddresses } from 'configs';

import { getVaultFactoryContract } from './vault-factory.js';

const DASHBOARD_PROXY_CODE_PAD_LEFT = '0x363d3d373d3d3d363d73';
const DASHBOARD_PROXY_CODE_PAD_RIGHT = '5af43d82803e903d91602b57fd5bf3';

export const getDashboardContract = async (
  address: Address,
): Promise<DashboardContract> => {
  const publicClient = await getPublicClient();

  return getContract({
    address: address,
    abi: DashboardAbi,
    client: publicClient,
  });
};

export type DashboardContract = Awaited<
  GetContractReturnType<typeof DashboardAbi, RegisteredPublicClient>
>;

const toDashboardProxyCode = (implementation: Address): Hex =>
  `0x${DASHBOARD_PROXY_CODE_PAD_LEFT.slice(2)}${implementation
    .slice(2)
    .toLowerCase()}${DASHBOARD_PROXY_CODE_PAD_RIGHT}` as Hex;

let dashboardProxyCodesCache: Promise<Hex[]> | undefined;

// Current factory impl plus the deployed-config ones, so Dashboards cloned
// from an earlier impl still pass.
const getDashboardProxyCodes = (): Promise<Hex[]> => {
  dashboardProxyCodesCache ??= (async () => {
    const vaultFactory = await getVaultFactoryContract();
    const currentImpl = await vaultFactory.read.DASHBOARD_IMPL();
    const impls = new Set(
      [currentImpl, ...getDashboardImplAddresses()].map((impl) =>
        impl.toLowerCase(),
      ),
    );

    return [...impls].map((impl) => toDashboardProxyCode(impl as Address));
  })().catch((error: unknown) => {
    dashboardProxyCodesCache = undefined;
    throw error;
  });

  return dashboardProxyCodesCache;
};

/**
 * Whether `address` is a Dashboard, detected by comparing its deployed
 * bytecode against the canonical Dashboard clone-proxy code of a known
 * Dashboard implementation.
 */
export const isDashboard = async (address: Address): Promise<boolean> => {
  const publicClient = await getPublicClient();
  const [code, proxyCodes] = await Promise.all([
    publicClient.getCode({ address }),
    getDashboardProxyCodes(),
  ]);
  if (!code) return false;

  const normalizedCode = code.toLowerCase();

  return proxyCodes.some((proxyCode) => normalizedCode.startsWith(proxyCode));
};

/**
 * Whether `dashboard` is the Dashboard of `vault`, i.e. its `stakingVault()`
 * points back at the vault.
 */
export const isDashboardBelongsToVault = async (
  vault: Address,
  dashboard: Address,
): Promise<boolean> => {
  const dashboardContract = await getDashboardContract(dashboard);
  const stakingVault = await dashboardContract.read.stakingVault();

  return stakingVault.toLowerCase() === vault.toLowerCase();
};
