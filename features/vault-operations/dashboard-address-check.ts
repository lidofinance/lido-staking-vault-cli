import { Address } from 'viem';
import { program } from 'command';

import {
  getDashboardContract,
  isDashboard,
  isDashboardBelongsToVault,
  type DashboardContract,
} from 'contracts';
import { confirmPrompt, confirmOperation, logInfo } from 'utils';

const DASHBOARD_BELONGS_TO_VAULT_MESSAGE =
  'Do you want to check Dashboard address that is belonging to stVault?';
const IS_DASHBOARD_MESSAGE =
  'Do you want to check that this address is a Dashboard contract?';
const RISK_MESSAGE =
  'By proceeding, you accept the risk that the stVault is managed by a contract other than the Dashboard.';

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

const warnAndConfirmProceed = async (warning: string): Promise<boolean> => {
  logInfo(`⚠️  ${warning}`);
  logInfo(`⚠️  ${RISK_MESSAGE}`);

  return confirmOperation('Do you want to proceed?');
};

/**
 * Verifies that `address` is a Dashboard and, when `vault` is supplied, that
 * it is the Dashboard of that vault. The check is opt-out: it runs by default
 * and is skipped only when the user answers "no" to the confirmation prompt.
 *
 * A failed check does not abort immediately: it warns about which stage failed
 * and the risk of proceeding, then lets the user exit or continue.
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
    const proceed = await warnAndConfirmProceed(
      `Address ${address} is not a Dashboard contract.`,
    );
    if (!proceed) {
      throw new Error(`Address ${address} is not a Dashboard contract`);
    }
    return;
  }

  if (vault) {
    const belongsToVault = await isDashboardBelongsToVault(vault, address);
    if (!belongsToVault) {
      const proceed = await warnAndConfirmProceed(
        `Dashboard ${address} does not belong to vault ${vault}.`,
      );
      if (!proceed) {
        throw new Error(
          `Dashboard ${address} does not belong to vault ${vault}`,
        );
      }
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
