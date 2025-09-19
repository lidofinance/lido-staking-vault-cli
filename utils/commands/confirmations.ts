import {
  Address,
  decodeFunctionData,
  type Hex,
  type GetContractReturnType,
  WalletClient,
  formatEther,
  Abi,
} from 'viem';

import { getPublicClient } from 'providers';
import { confirmOperation, formatBP, selectProposalEvent } from 'utils';
import { AccessControlConfirmableAbi } from 'abi';

const AVG_BLOCK_TIME_SEC = 12n;

// Define argument types for each function
type FunctionArgsMap = {
  setConfirmExpiry: readonly [bigint];
  setNodeOperatorFeeRate: readonly [bigint];
  changeTier: readonly [Address, bigint, bigint];
  transferVaultOwnership: readonly [Address];
};

// Type-safe function map
export const CONFIRM_METHODS_MAP = {
  setConfirmExpiry: (args: FunctionArgsMap['setConfirmExpiry']) =>
    `${Number(args[0]) / 3600} hours`,
  setNodeOperatorFeeRate: (args: FunctionArgsMap['setNodeOperatorFeeRate']) =>
    formatBP(args[0]),
  changeTier: (args: FunctionArgsMap['changeTier']) =>
    `vault: ${args[0]}, tier: ${args[1]}, requested share limit: ${formatEther(args[2])} shares`,
  transferVaultOwnership: (args: FunctionArgsMap['transferVaultOwnership']) =>
    `new owner: ${args[0]}`,
} as const;

type FunctionName = keyof typeof CONFIRM_METHODS_MAP;
type DecodedData = {
  [K in FunctionName]: {
    functionName: K;
    args: FunctionArgsMap[K];
  };
}[FunctionName];

type ConfirmationsInfo = {
  member: Address;
  role: Hex;
  expiryTimestamp: bigint;
  expiryDate: string;
  data: Hex;
  decodedData: DecodedData;
};
export type LogsData = Record<Hex, ConfirmationsInfo>;
type ConfirmationContract = GetContractReturnType<
  typeof AccessControlConfirmableAbi,
  WalletClient
>;

export const formatConfirmationArgs = (
  args:
    | readonly [bigint]
    | readonly [Address, bigint, bigint]
    | readonly [Address],
  functionName: FunctionName,
) => {
  switch (functionName) {
    case 'setConfirmExpiry':
      return CONFIRM_METHODS_MAP.setConfirmExpiry(
        args as FunctionArgsMap['setConfirmExpiry'],
      );
    case 'setNodeOperatorFeeRate':
      return CONFIRM_METHODS_MAP.setNodeOperatorFeeRate(
        args as FunctionArgsMap['setNodeOperatorFeeRate'],
      );
    case 'changeTier':
      return CONFIRM_METHODS_MAP.changeTier(
        args as FunctionArgsMap['changeTier'],
      );
    case 'transferVaultOwnership':
      return CONFIRM_METHODS_MAP.transferVaultOwnership(
        args as FunctionArgsMap['transferVaultOwnership'],
      );
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
};

export const getConfirmationsInfo = async <T extends ConfirmationContract>(
  contract: T,
  abi: Abi,
) => {
  const publicClient = getPublicClient();
  const confirmExpire = await contract.read.getConfirmExpiry();
  const currentBlock = await publicClient.getBlockNumber();
  const confirmExpireInBlocks = confirmExpire / AVG_BLOCK_TIME_SEC;

  const logs = await publicClient.getContractEvents({
    address: contract.address,
    abi: contract.abi,
    eventName: 'RoleMemberConfirmed',
    fromBlock: currentBlock - confirmExpireInBlocks,
    strict: true,
  });

  if (logs.length === 0) {
    return;
  }

  const logsData: LogsData = logs
    .sort((a, b) => Number(a.blockNumber - b.blockNumber))
    .reduce<Record<Hex, any>>((acc, log) => {
      const { args } = log;
      const decodedData = decodeFunctionData({
        abi,
        data: args.data,
      }) as DecodedData;

      acc[args.data] = {
        member: args.member,
        role: args.role,
        expiryTimestamp: args.expiryTimestamp,
        expiryDate: new Date(
          Number(args.expiryTimestamp) * 1000,
        ).toLocaleString(),
        data: args.data,
        decodedData,
      };

      return acc;
    }, {});

  await Promise.all(
    Object.entries(logsData).map(async ([data, { role }]) => {
      const confirmations = await contract.read.confirmation([
        data as Hex,
        role,
      ]);
      if (confirmations === 0n) delete logsData[data as Hex];
    }),
  );

  return logsData;
};

const filterLogsByVault = (logsData: LogsData, vault?: Address): LogsData => {
  if (!vault) return logsData;

  const entries = Object.entries(logsData).filter(([, info]) => {
    const { decodedData } = info;
    switch (decodedData.functionName) {
      case 'changeTier':
      case 'transferVaultOwnership': {
        const argVault = decodedData.args[0];
        return argVault.toLowerCase() === vault.toLowerCase();
      }
      default:
        return false;
    }
  });

  return entries.reduce<LogsData>((acc, [key, value]) => {
    acc[key as Hex] = value;
    return acc;
  }, {} as LogsData);
};

export const confirmProposal = async <T extends ConfirmationContract>({
  contract,
  additionalContracts,
  vault,
}: {
  contract: T;
  additionalContracts?: T[];
  vault?: Address;
}) => {
  const logsData = await getConfirmationsInfo(contract, contract.abi);
  const additionalLogsData = await Promise.all(
    additionalContracts?.map((additionalContract) =>
      getConfirmationsInfo(additionalContract, additionalContract.abi),
    ) ?? [],
  );
  if (!logsData && additionalLogsData.length === 0) return;
  const allLogsData = {
    ...(logsData ?? {}),
    ...additionalLogsData.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  };

  if (Object.keys(allLogsData).length === 0) {
    console.error('No proposals found');
    return;
  }
  const filteredLogsData = filterLogsByVault(allLogsData, vault);

  if (Object.keys(filteredLogsData).length === 0) {
    console.error('No proposals found for the specified vault');
    return;
  }

  const answer = await selectProposalEvent(filteredLogsData);
  if (!answer || !answer.event) {
    return;
  }
  const log = filteredLogsData[answer.event];
  if (!log) {
    console.error('No proposal found');
    return;
  }

  // Type-safe function call using discriminated union
  const formattedArgs = formatConfirmationArgs(
    log.decodedData.args,
    log.decodedData.functionName,
  );
  const confirm = await confirmOperation(
    `Are you sure you want to confirm this proposal?
    ${log.decodedData.functionName} (${log.decodedData.args.join(', ')} - ${formattedArgs})
    Member: ${log.member}
    Role: ${log.role}
    Expiry: ${log.expiryDate}`,
  );
  if (!confirm) return;

  return log;
};
