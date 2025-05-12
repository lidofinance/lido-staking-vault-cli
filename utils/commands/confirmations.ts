import { Address, decodeFunctionData, type Hex } from 'viem';

import { getDashboardContract } from 'contracts';
import { getPublicClient } from 'providers';
import {
  callReadMethodSilent,
  confirmOperation,
  logResult,
  logTable,
  selectProposalEvent,
} from 'utils';
import { DashboardAbi } from 'abi';

const AVG_BLOCK_TIME_SEC = 12n;

type ConfirmationsInfo = {
  member: Address;
  role: Hex;
  expiryTimestamp: bigint;
  expiryDate: string;
  data: Hex;
  decodedData: {
    functionName: string;
    args: any[];
  };
};
export type LogsData = Record<Hex, ConfirmationsInfo>;

export const getConfirmationsInfo = async (address: Address) => {
  const publicClient = getPublicClient();
  const contract = getDashboardContract(address);
  const confirmExpire = await callReadMethodSilent(
    contract,
    'getConfirmExpiry',
  );
  const currentBlock = await publicClient.getBlockNumber();
  const confirmExpireInBlocks = confirmExpire / AVG_BLOCK_TIME_SEC;

  const setConfirmationLifetimeEventFilter =
    await publicClient.createContractEventFilter({
      abi: DashboardAbi,
      address: address,
      eventName: 'RoleMemberConfirmed',
      fromBlock: currentBlock - confirmExpireInBlocks,
    });

  const logs = await publicClient.getFilterLogs({
    filter: setConfirmationLifetimeEventFilter,
  });

  const logsData: LogsData = logs
    .map((log) => log.args)
    .filter(
      (args) => args.data && args.role && args.member && args.expiryTimestamp,
    )
    .sort((a, b) =>
      Number((a.expiryTimestamp ?? 0n) - (b.expiryTimestamp ?? 0n)),
    )
    .reduce<Record<Hex, any>>((acc, args) => {
      const decodedData = decodeFunctionData({
        abi: DashboardAbi,
        data: args.data as Hex,
      });

      acc[args.data as Hex] = {
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
      const confirmations = await callReadMethodSilent(
        contract,
        'confirmations',
        [data as Hex, role],
      );
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
          ['Argument', decodedData.args[0] as Hex],
        ],
      });
    },
  );

  return logsData;
};

export const confirmProposal = async (address: Address) => {
  const logsData = await getConfirmationsInfo(address);
  if (Object.keys(logsData).length === 0) {
    console.error('No proposals found');
    return;
  }

  const { event } = await selectProposalEvent(logsData);
  if (!event) return;
  const log = logsData[event];
  if (!log) {
    console.error('Log not found');
    return;
  }

  const confirm = await confirmOperation(
    `Are you sure you want to confirm this proposal?
    ${log.decodedData.functionName} (${log.decodedData.args.join(', ')})
    Member: ${log.member}
    Role: ${log.role}
    Expiry: ${log.expiryDate}`,
  );
  if (!confirm) return;

  return log;
};
