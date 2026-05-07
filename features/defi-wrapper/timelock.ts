import {
  logInfo,
  callWriteMethodWithReceipt,
  confirmOperation,
  callReadMethodSilent,
  stringToAddress,
  addressPrompt,
  stringToHash,
  textPrompt,
  DEFAULT_SALT,
} from 'utils';
import {
  Address,
  Hex,
  zeroHash,
  isHash,
  formatEther,
  parseEventLogs,
} from 'viem';
import {
  getTimeLockContract,
  TimeLockContract,
} from 'contracts/defi-wrapper/index.js';

// Common constants
export const DEFAULT_PREDECESSOR = zeroHash;

// Common argument and option definitions
export const TIMELOCK_ARGUMENT = [
  '[timelock]',
  'timelock contract address',
  stringToAddress,
] as const;

export const OPERATION_ID_ARGUMENT = [
  '[operationId]',
  'operation ID (bytes32 hash)',
  stringToHash,
] as const;

export const ROLE_ARGUMENT = [
  '[role]',
  'role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
] as const;
export const ACCOUNT_GRANT_ARGUMENT = [
  '[account]',
  'account address to grant role to',
  stringToAddress,
] as const;

export const ACCOUNT_REVOKE_ARGUMENT = [
  '[account]',
  'account address to revoke role from',
  stringToAddress,
] as const;

export const SALT_OPTION = [
  '-s, --salt <salt>',
  'salt for operation (bytes32 hex, default: 0x0)',
  stringToHash,
  DEFAULT_SALT,
] as const;

// Helper function to get timelock from argument or prompt user
export const getPromptTimelock = async (
  argAddress: Address | undefined,
): Promise<TimeLockContract> => {
  if (argAddress) return getTimeLockContract(argAddress);

  const timelockPrompt = await addressPrompt(
    'Enter timelock contract address',
    'timelock',
  );
  return getTimeLockContract(timelockPrompt.timelock as Address);
};

export const promptOperationId = async (
  operationIdInput: string | undefined,
) => {
  if (!operationIdInput) {
    const operationIdPrompt = await textPrompt(
      'Enter operation ID (bytes32 hash)',
      'operationId',
    );
    operationIdInput = operationIdPrompt.operationId as string;
  }

  // Validate and convert to hex - if already hex, use as is
  const operationId = isHash(operationIdInput)
    ? operationIdInput
    : stringToHash(operationIdInput);
  return operationId;
};

export const waitTimeTo = (timestamp: bigint) => {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return timestamp > now ? timestamp - now : 0n;
};

// Helper function for propose operations
export const proposeOperation = async (
  timelock: Address,
  target: Address,
  data: Hex,
  salt: Hex,
  functionName: string,
  confirmationMessage: string,
  value = 0n,
  predecessor: Hex = DEFAULT_PREDECESSOR,
): Promise<Hex> => {
  const timelockContract = await getTimeLockContract(timelock);
  const minDelay = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'getMinDelay',
    payload: [],
  });

  const operationId = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'hashOperation',
    payload: [[target, value, data, predecessor, salt]],
  });

  logInfo('Proposing operation:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: ${formatEther(value)} ETH`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);
  logInfo(`  Function: ${functionName}`);
  logInfo(`  Min delay: ${minDelay} seconds`);

  const confirm = await confirmOperation(confirmationMessage);
  if (!confirm) {
    throw new Error('Operation cancelled by user');
  }

  const { receipt } = await callWriteMethodWithReceipt({
    contract: timelockContract,
    methodName: 'schedule',
    payload: [target, value, data, predecessor, salt, minDelay],
  });

  if (receipt?.logs) {
    const events = parseEventLogs({
      abi: timelockContract.abi,
      logs: receipt.logs,
      strict: true,
      eventName: 'CallScheduled',
    });
    if (events.length > 1) {
      logInfo(
        `⚠️ Multiple CallScheduled events found in receipt logs. Check the transaction details for more info.`,
      );
    }
    const event = events[0];
    if (!event) {
      logInfo(
        `⚠️ No CallScheduled event found in receipt logs. Check the transaction details for more info.`,
      );
    } else if (event?.args.id !== operationId) {
      logInfo(
        `⚠️ Operation ID from event (${event.args.id}) does not match calculated operation ID (${operationId}). Check the transaction details for more info.`,
      );
    }
  }

  logInfo(`✅ Operation proposed successfully!`);
  logInfo(`   Operation ID: ${operationId}`);
  logInfo(`   Execute after: ${minDelay} seconds`);

  return operationId;
};

// Helper function for execute operations
export const executeOperation = async (
  timelock: Address,
  target: Address,
  data: Hex,
  salt: Hex,
  functionName: string,
  confirmationMessage: string,
  value = 0n,
  predecessor: Hex = DEFAULT_PREDECESSOR,
): Promise<void> => {
  const timelockContract = await getTimeLockContract(timelock);

  const operationId = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'hashOperation',
    payload: [[target, value, data, predecessor, salt]],
  });

  logInfo('Calculated operation details:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: ${formatEther(value)} ETH`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);

  const state = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'getOperationState',
    payload: [[operationId]],
  });

  if (state === 0) {
    logInfo('❌ Operation not found (Unset)');
    logInfo(`   Operation ID: ${operationId}`);
    return;
  }
  if (state === 3) {
    logInfo('✅ Operation already executed (Done)');
    return;
  }
  if (state === 1) {
    const timestamp = await callReadMethodSilent({
      contract: timelockContract,
      methodName: 'getTimestamp',
      payload: [[operationId]],
    });
    const waitTime = waitTimeTo(timestamp);
    logInfo(
      `⏳ Operation is waiting. Will be ready at timestamp ${timestamp} (in ${waitTime} seconds)`,
    );
    return;
  }

  logInfo('Executing operation:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Function: ${functionName}`);

  const confirm = await confirmOperation(confirmationMessage);
  if (!confirm) return;

  await callWriteMethodWithReceipt({
    contract: timelockContract,
    methodName: 'execute',
    payload: [target, value, data, predecessor, salt],
    value: value,
  });

  logInfo(`✅ Operation executed successfully!`);
  logInfo(`   Operation ID: ${operationId}`);
};
