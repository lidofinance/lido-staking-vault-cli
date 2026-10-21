import { Address } from 'viem';
import { program } from 'command';

import {
  getDashboardContract,
  isDashboard,
  isDashboardBelongsToVault,
  type DashboardContract,
} from 'contracts';
import {
  confirmPrompt,
  confirmOperation,
  isAutoConfirmEnvironment,
  isJsonMode,
  logInfo,
} from 'utils';

const DASHBOARD_BELONGS_TO_VAULT_MESSAGE =
  'Do you want to verify that the Dashboard belongs to the stVault?';
const IS_DASHBOARD_MESSAGE =
  'Do you want to verify that this address is a Dashboard contract?';
const RISK_MESSAGE =
  'By proceeding, you accept the risk that the stVault is managed by a contract other than the Dashboard.';

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const confirmDashboardAddressCheck = async (
  message: string,
): Promise<boolean> => {
  const opts = program.opts();

  if (opts.yes || isAutoConfirmEnvironment() || isJsonMode()) return true;

  const { confirm } = await confirmPrompt(message, 'confirm', true);

  // Ctrl+C / Esc / closed stdin resolve with no answer: abort, not skip
  if (confirm === undefined) throw new Error('Command cancelled');
  if (!confirm) {
    logInfo('⚠️  Dashboard address check skipped.');
    return false;
  }

  return true;
};

const warnAndConfirmProceed = async (warning: string): Promise<boolean> => {
  logInfo(`⚠️  ${warning}`);
  logInfo(`⚠️  ${RISK_MESSAGE}`);

  const opts = program.opts();
  if (opts.skipDashboardCheck) return true;
  // --yes must not auto-accept a failed check
  if (opts.yes) {
    throw new Error(
      `${warning} Use --skip-dashboard-check to proceed non-interactively.`,
    );
  }
  // --json cannot prompt interactively, so fail closed instead
  if (isJsonMode()) {
    throw new Error(
      `${warning} Use --skip-dashboard-check to proceed in --json mode.`,
    );
  }

  return confirmOperation('Do you want to proceed?');
};

/**
 * Verifies that `address` is a Dashboard and, when `vault` is supplied, that
 * it is the Dashboard of that vault. The check is opt-out: it runs by default
 * and is skipped only when the user answers "no" to the confirmation prompt.
 *
 * A failed or rejected check does not abort immediately: it warns about which
 * stage failed and the risk of proceeding, then lets the user exit or continue.
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

  let isDashboardContract: boolean;
  try {
    isDashboardContract = await isDashboard(address);
  } catch (error) {
    const proceed = await warnAndConfirmProceed(
      `Failed to verify whether ${address} is a Dashboard: ${getErrorMessage(
        error,
      )}.`,
    );
    if (!proceed) throw error;
    return;
  }

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
    let belongsToVault: boolean;
    try {
      belongsToVault = await isDashboardBelongsToVault(vault, address);
    } catch (error) {
      const proceed = await warnAndConfirmProceed(
        `Failed to verify whether Dashboard ${address} belongs to vault ${vault}: ${getErrorMessage(
          error,
        )}.`,
      );
      if (!proceed) throw error;
      return;
    }

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
