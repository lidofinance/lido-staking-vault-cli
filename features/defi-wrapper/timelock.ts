import {
  logInfo,
  callWriteMethodWithReceipt,
  confirmOperation,
  callReadMethodSilent,
} from 'utils';
import { Address, Hex } from 'viem';
import { getTimeLockContract } from 'contracts/defi-wrapper/index.js';
import { getPublicClient } from 'providers';

// Helper function to resolve role
export const resolveRole = async (
  roleInput: string,
  contractAddress: Address,
  getContract: (address: Address) => Promise<any>,
): Promise<Hex> => {
  if (!roleInput.startsWith('0x')) {
    const contract = await getContract(contractAddress);
    try {
      const role = (await callReadMethodSilent({
        contract,
        methodName: roleInput as any,
        payload: [],
      })) as Hex;
      logInfo(`Resolved role "${roleInput}" to ${role}`);
      return role;
    } catch {
      throw new Error(
        `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE) or bytes32 hex.`,
      );
    }
  } else {
    return roleInput as Hex;
  }
};

// Helper function for propose operations
export const proposeOperation = async (
  timelock: Address,
  target: Address,
  data: Hex,
  salt: Hex,
  functionName: string,
  confirmationMessage: string,
): Promise<Hex> => {
  const timelockContract = await getTimeLockContract(timelock);
  const minDelay = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'getMinDelay',
    payload: [],
  });

  const predecessor =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

  const operationId = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'hashOperation',
    payload: [[target, 0n, data, predecessor, salt]],
  });

  logInfo('Proposing operation:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: 0`);
  logInfo(`  Payload: ${data}`);
  logInfo(`  Predecessor: ${predecessor}`);
  logInfo(`  Salt: ${salt}`);
  logInfo(`  Function: ${functionName}`);
  logInfo(`  Min delay: ${minDelay} seconds`);

  const confirm = await confirmOperation(confirmationMessage);
  if (!confirm) {
    throw new Error('Operation cancelled by user');
  }

  await callWriteMethodWithReceipt({
    contract: timelockContract,
    methodName: 'schedule',
    payload: [target, 0n, data, predecessor, salt, minDelay],
  });

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
): Promise<void> => {
  const timelockContract = await getTimeLockContract(timelock);
  const predecessor =
    '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

  const operationId = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'hashOperation',
    payload: [[target, 0n, data, predecessor, salt]],
  });

  logInfo('Calculated operation details:');
  logInfo(`  Operation ID: ${operationId}`);
  logInfo(`  Target: ${target}`);
  logInfo(`  Value: 0`);
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
    const publicClient = await getPublicClient();
    const currentBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const now = currentBlock.timestamp;
    const waitTime = timestamp > now ? timestamp - now : 0n;
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
    payload: [target, 0n, data, predecessor, salt],
  });

  logInfo(`✅ Operation executed successfully!`);
  logInfo(`   Operation ID: ${operationId}`);
};
