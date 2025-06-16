import { LogsData, formatConfirmationArgs } from 'utils';

import { selectPrompt } from './default.js';

export const selectProposalEvent = async (logsData: LogsData) => {
  const events = Object.values(logsData).map((log) => {
    const formattedArgs = formatConfirmationArgs(
      log.decodedData.args,
      log.decodedData.functionName,
    );
    const argsDescription = `Args: ${log.decodedData.args.join(', ')} (${formattedArgs})`;

    return {
      title: log.decodedData.functionName,
      value: log.data,
      description: `Member: ${log.member}\nRole: ${log.role}\nExpiry: ${log.expiryDate}\n${argsDescription}`,
    };
  });

  const event = await selectPrompt('Select an event', 'event', events);
  if (!event) return;

  return event;
};
