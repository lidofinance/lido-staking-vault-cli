import { parseEventLogs, parseEther } from 'viem';
import { RoleAssignment, VaultWithDashboard } from 'types';
import { getVaultFactoryContract } from 'contracts';
import { VaultFactoryAbi } from 'abi/index.js';
import {
  callWriteMethodWithReceipt,
  logResult,
  printError,
  showSpinner,
  logError,
  transformAddressesToArray,
  validateAddressesMap,
  validateAddressMap,
} from 'utils';
import { program } from 'command';

export const prepareCreateVaultPayload = (args: {
  defaultAdmin: string;
  nodeOperator: string;
  nodeOperatorManager: string;
  nodeOperatorFeeBP: bigint;
  confirmExpiry: bigint;
  quantity: string;
  options: { roles: RoleAssignment[] };
}) => {
  const {
    defaultAdmin,
    nodeOperator,
    nodeOperatorManager,
    nodeOperatorFeeBP,
    confirmExpiry,
    quantity,
    options,
  } = args;

  const qnt = parseInt(quantity);
  const otherRoles = options.roles || [];

  if (isNaN(qnt)) {
    logError('quantity must be a number');
    return;
  }

  const addresses = transformAddressesToArray(otherRoles);

  const errorsAddressesList = validateAddressesMap(addresses);
  const errorsList = [
    ...errorsAddressesList,
    ...validateAddressMap([nodeOperator, defaultAdmin, nodeOperatorManager]),
  ];
  if (errorsList.length > 0) {
    errorsList.forEach((error) => program.error(error));
    return;
  }

  // eslint-disable-next-line unicorn/new-for-builtins
  const list: number[] = Array.from(Array(qnt));
  const payload = {
    defaultAdmin,
    nodeOperator,
    nodeOperatorManager,
    confirmExpiry,
    nodeOperatorFeeBP,
  } as VaultWithDashboard;

  return {
    payload,
    list,
    otherRoles,
  };
};

export const createVault = async (
  payload: VaultWithDashboard,
  otherRoles: RoleAssignment[] = [],
  methodName:
    | 'createVaultWithDashboard'
    | 'createVaultWithDashboardWithoutConnectingToVaultHub' = 'createVaultWithDashboard',
) => {
  const contract = getVaultFactoryContract();

  const {
    defaultAdmin,
    nodeOperator,
    nodeOperatorManager,
    nodeOperatorFeeBP,
    confirmExpiry,
  } = payload;

  const isNeedValue = methodName === 'createVaultWithDashboard';

  const result = await callWriteMethodWithReceipt({
    contract,
    methodName,
    payload: [
      defaultAdmin,
      nodeOperator,
      nodeOperatorManager,
      nodeOperatorFeeBP,
      confirmExpiry,
      otherRoles,
    ],
    value: isNeedValue ? parseEther('1') : undefined,
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
