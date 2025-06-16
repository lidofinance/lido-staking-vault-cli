import {
  Address,
  decodeFunctionData,
  type Hex,
  type GetContractReturnType,
  WalletClient,
  formatEther,
} from 'viem';

import { getPublicClient } from 'providers';
import {
  confirmOperation,
  formatBP,
  logResult,
  logTable,
  selectProposalEvent,
} from 'utils';
import { DashboardAbi, AccessControlConfirmableAbi } from 'abi';

const AVG_BLOCK_TIME_SEC = 12n;

// Define argument types for each function
type FunctionArgsMap = {
  setConfirmExpiry: readonly [bigint];
  setNodeOperatorFeeBP: readonly [bigint];
  changeTier: readonly [Address, bigint, bigint];
};

// Type-safe function map
export const CONFIRM_METHODS_MAP = {
  setConfirmExpiry: (args: FunctionArgsMap['setConfirmExpiry']) =>
    `${Number(args[0]) / 3600} hours`,
  setNodeOperatorFeeBP: (args: FunctionArgsMap['setNodeOperatorFeeBP']) =>
    formatBP(args[0]),
  changeTier: (args: FunctionArgsMap['changeTier']) =>
    `vault: ${args[0]}, tier: ${args[1]}, requested share limit: ${formatEther(args[2])} shares`,
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

const formatArgs = (
  args: readonly [bigint] | readonly [Address, bigint, bigint],
  functionName: FunctionName,
) => {
  switch (functionName) {
    case 'setConfirmExpiry':
      return CONFIRM_METHODS_MAP.setConfirmExpiry(
        args as FunctionArgsMap['setConfirmExpiry'],
      );
    case 'setNodeOperatorFeeBP':
      return CONFIRM_METHODS_MAP.setNodeOperatorFeeBP(
        args as FunctionArgsMap['setNodeOperatorFeeBP'],
      );
    case 'changeTier':
      return CONFIRM_METHODS_MAP.changeTier(
        args as FunctionArgsMap['changeTier'],
      );
    default:
      throw new Error(`Unknown function: ${functionName}`);
  }
};

export const getConfirmationsInfo = async <T extends ConfirmationContract>(
  contract: T,
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
    console.error('No confirmations found');
    return;
  }

  const logsData: LogsData = logs
    .sort((a, b) => Number(a.blockNumber - b.blockNumber))
    .reduce<Record<Hex, any>>((acc, log) => {
      const { args } = log;
      const decodedData = decodeFunctionData({
        abi: DashboardAbi,
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

  logResult({});
  Object.entries(logsData).forEach(
    (
      [data, { member, role, expiryTimestamp, expiryDate, decodedData }],
      idx,
    ) => {
      console.info(`\nEvent ${idx + 1}`);
      logTable({
        data: [
          ['Member', member],
          ['Role', role],
          ['Expiry Timestamp', `${expiryTimestamp.toString()} (${expiryDate})`],
          ['Data', data],
        ],
      });

      console.info('Decoded data:');
      logTable({
        data: [
          ['Function', decodedData.functionName],
          ['Argument', decodedData.args[0]],
        ],
      });
    },
  );

  return logsData;
};

export const confirmProposal = async <T extends ConfirmationContract>(
  contract: T,
) => {
  const logsData = await getConfirmationsInfo(contract);
  if (!logsData) return;

  if (Object.keys(logsData).length === 0) {
    console.error('No proposals found');
    return;
  }
  const answer = await selectProposalEvent(logsData);
  if (!answer || !answer.event) {
    return;
  }
  const log = logsData[answer.event];
  if (!log) {
    console.error('No proposal found');
    return;
  }

  // Type-safe function call using discriminated union
  const formattedArgs = formatArgs(
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
