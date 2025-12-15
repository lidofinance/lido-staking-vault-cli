import {
  Address,
  parseEventLogs,
  parseEther,
  Hex,
  TransactionReceipt,
} from 'viem';

import { RoleAssignment, VaultWithDashboard } from 'types';
import {
  getDashboardContract,
  getStakingVaultContract,
  getVaultFactoryContract,
} from 'contracts';
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
  logInfo,
  callReadMethodSilent,
} from 'utils';
import { program } from 'command';

export type CreateVaultResult = {
  vault: Address;
  dashboard: Address;
  owner: Address;
  nodeOperator: Address;
  nodeOperatorManager: readonly Address[];
  tx: Hex;
  blockNumber: bigint;
};

export const isCreateVaultResult = (
  result: Pick<CreateVaultResult, 'tx'> | CreateVaultResult | undefined,
): result is CreateVaultResult => {
  return result !== undefined && 'vault' in result;
};

export const prepareCreateVaultPayload = (args: {
  defaultAdmin: Address;
  nodeOperator: Address;
  nodeOperatorManager: Address;
  nodeOperatorFeeRate: number;
  confirmExpiry: number;
  quantity: string;
  roles: RoleAssignment[];
}) => {
  const {
    defaultAdmin,
    nodeOperator,
    nodeOperatorManager,
    nodeOperatorFeeRate,
    confirmExpiry,
    quantity,
    roles,
  } = args;

  const qnt = parseInt(quantity);
  const otherRoles = roles || [];

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
    confirmExpiry: BigInt(confirmExpiry),
    nodeOperatorFeeRate: BigInt(nodeOperatorFeeRate),
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
): Promise<Pick<CreateVaultResult, 'tx'> | CreateVaultResult | undefined> => {
  const contract = await getVaultFactoryContract();

  const {
    defaultAdmin,
    nodeOperator,
    nodeOperatorManager,
    nodeOperatorFeeRate,
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
      nodeOperatorFeeRate,
      confirmExpiry,
      otherRoles,
    ],
    value: isNeedValue ? parseEther('1') : undefined,
  });
  if (!result) {
    throw new Error('Transaction failed');
  }

  if (program.opts().populateTx && result.tx) {
    return { tx: result.tx };
  }
  const { receipt, tx } = result;

  // Gnosis safe case
  if (!receipt || !tx) {
    logInfo(
      'Transaction has been sent. Use "log-creating-vault-data" command to get the Vault data after the transaction is signed and executed',
    );
    return;
  }

  const eventData = await getCreateVaultEventData(receipt, tx);

  return eventData;
};

export const getCreateVaultEventData = async (
  receipt: TransactionReceipt,
  tx: Hex,
): Promise<CreateVaultResult> => {
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

  if (!vault || !dashboard || !owner) {
    throw new Error('Vault, dashboard or owner not found');
  }

  const dashboardContract = await getDashboardContract(dashboard);
  const vaultContract = await getStakingVaultContract(vault);
  const [nodeOperator, nodeOperatorManagerRole] = await Promise.all([
    callReadMethodSilent(vaultContract, 'nodeOperator'),
    callReadMethodSilent(dashboardContract, 'NODE_OPERATOR_MANAGER_ROLE'),
  ]);
  const nodeOperatorManager = await callReadMethodSilent(
    dashboardContract,
    'getRoleMembers',
    [nodeOperatorManagerRole],
  );

  return {
    vault,
    dashboard,
    owner,
    nodeOperator,
    nodeOperatorManager,
    tx,
    blockNumber: receipt.blockNumber,
  };
};

export const getVaultFactoryInfo = async () => {
  const contract = await getVaultFactoryContract();
  const hideSpinner = showSpinner();
  try {
    const BEACON = await contract.read.BEACON();
    const LIDO_LOCATOR = await contract.read.LIDO_LOCATOR();
    const CONTRACT_ADDRESS = contract.address;

    const payload = {
      CONTRACT_ADDRESS,
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
