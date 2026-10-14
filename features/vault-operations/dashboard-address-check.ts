import { Address } from 'viem';
import { program } from 'command';

import {
  getDashboardContract,
  isDashboard,
  isDashboardBelongsToVault,
  type DashboardContract,
} from 'contracts';
import { confirmPrompt } from 'utils';

const DASHBOARD_BELONGS_TO_VAULT_MESSAGE =
  'Do you want to check Dashboard address that is belonging to stVault?';
const IS_DASHBOARD_MESSAGE =
  'Do you want to check that this address is a Dashboard contract?';

const confirmDashboardAddressCheck = async (
  message: string,
): Promise<boolean> => {
  const opts = program.opts();
  const isTestEnvironment =
    process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

  if (opts.yes || isTestEnvironment) return true;

  const { confirm } = await confirmPrompt(message, 'confirm', true);

  return confirm;
};

/**
 * Verifies that `address` is a Dashboard and, when `vault` is supplied, that
 * it is the Dashboard of that vault. The check is opt-out: it runs by default
 * and is skipped only when the user answers "no" to the confirmation prompt.
 */
export const verifyDashboardAddress = async (
  address: Address,
  vault?: Address,
): Promise<void> => {
  const message = vault
    ? DASHBOARD_BELONGS_TO_VAULT_MESSAGE
    : IS_DASHBOARD_MESSAGE;
  const shouldCheck = await confirmDashboardAddressCheck(message);

  if (!shouldCheck) return;

  const isDashboardContract = await isDashboard(address);
  if (!isDashboardContract) {
    throw new Error(`Address ${address} is not a Dashboard contract`);
  }

  if (vault) {
    const belongsToVault = await isDashboardBelongsToVault(vault, address);
    if (!belongsToVault) {
      throw new Error(`Dashboard ${address} does not belong to vault ${vault}`);
    }
  }
};

/**
 * `getDashboardContract` that first verifies the address is a Dashboard.
 */
export const getDashboardContractChecked = async (
  address: Address,
): Promise<DashboardContract> => {
  await verifyDashboardAddress(address);

  return getDashboardContract(address);
};
