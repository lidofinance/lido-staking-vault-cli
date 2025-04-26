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
      '0x',
    ],
    value: parseEther('1'),
  });
  if (!result) return;
  const { receipt, tx } = result;

  const events = parseEventLogs({
    abi: VaultFactoryAbi,
    logs: receipt.logs,
  });

  const vaultEvent = events.find((event) => event.eventName === 'VaultCreated');
  const vault = vaultEvent?.args.vault;
  const dashboard = vaultEvent?.args.owner;

  return {
    vault,
    dashboard,
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

    logResult(Object.entries(payload));
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};
