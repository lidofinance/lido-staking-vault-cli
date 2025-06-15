import { parseEventLogs, parseEther } from 'viem';
import { RoleAssignment, VaultWithDashboard } from 'types';
import { getVaultFactoryContract } from 'contracts';
import { VaultFactoryAbi } from 'abi/index.js';
import {
  callWriteMethodWithReceipt,
  logResult,
  printError,
  showSpinner,
} from 'utils';
import { program } from 'command';

export const createVault = async (
  payload: VaultWithDashboard,
  otherRoles: RoleAssignment[] = [],
) => {
  const contract = getVaultFactoryContract();

  const {
    defaultAdmin,
    nodeOperator,
    nodeOperatorManager,
    nodeOperatorFeeBP,
    confirmExpiry,
  } = payload;

  const result = await callWriteMethodWithReceipt({
    contract,
    methodName: 'createVaultWithDashboard',
    payload: [
      defaultAdmin,
      nodeOperator,
      nodeOperatorManager,
      nodeOperatorFeeBP,
      confirmExpiry,
      otherRoles,
    ],
    value: parseEther('1'),
  });
  if (!result) return;
  if (program.opts().populateTx) {
    return { tx: result.tx };
  }
  const { receipt, tx } = result;

  const events = parseEventLogs({
    abi: VaultFactoryAbi,
    logs: receipt.logs,
  });

  const vaultEvent = events.find((event) => event.eventName === 'VaultCreated');
  const vault = vaultEvent?.args.vault;

  const dashboardEvent = events.find(
    (event) => event.eventName === 'DashboardCreated',
  );
  const dashboard = dashboardEvent?.args.dashboard;
  const owner = dashboardEvent?.args.admin;

  return {
    vault,
    dashboard,
    owner,
    tx,
    blockNumber: receipt.blockNumber,
  };
};

export const getVaultFactoryInfo = async () => {
  const contract = getVaultFactoryContract();
  const hideSpinner = showSpinner();
  try {
    const BEACON = await contract.read.BEACON();
    const LIDO_LOCATOR = await contract.read.LIDO_LOCATOR();

    const payload = {
      BEACON,
      LIDO_LOCATOR,
    };

    hideSpinner();

    logResult({
      data: Object.entries(payload).map(([key, value]) => [key, value]),
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};
