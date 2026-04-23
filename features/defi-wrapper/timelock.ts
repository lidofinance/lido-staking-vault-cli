import {
  logInfo,
  callWriteMethodWithReceipt,
  confirmOperation,
  callReadMethodSilent,
  stringToAddress,
  addressPrompt,
  stringToHash,
  textPrompt,
} from 'utils';
import {
  Address,
  Hex,
  zeroHash,
  isHash,
  GetContractReturnType,
  PublicClient,
  Abi,
  formatEther,
} from 'viem';
import {
  getTimeLockContract,
  TimeLockContract,
} from 'contracts/defi-wrapper/index.js';

// Common constants
export const DEFAULT_SALT = zeroHash;
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

export const promptRole = async (
  roleInput: string | undefined,
  // hard to match correct type here
  contract: unknown,
) => {
  if (!roleInput) {
    const rolePrompt = await textPrompt(
      'Enter role (bytes32 hex or role name like DEFAULT_ADMIN_ROLE)',
      'role',
    );
    roleInput = rolePrompt.role as string;
  }

  const role = await resolveRole(
    roleInput,
    contract as GetContractReturnType<Abi, PublicClient>,
  );
  return role;
};

export const promptAccount = async (
  accountInput: string | undefined,
  message: string,
) => {
  let account: Address;
  if (!accountInput) {
    const accountPrompt = await addressPrompt(message, 'account');
    account = accountPrompt.account as Address;
  } else {
    account = stringToAddress(accountInput);
  }
  return account;
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

// Helper function to process salt option
// Note: saltOption is already validated as Hex by Commander's stringToHash parser (SALT_OPTION)
export const processSalt = (saltOption?: string): Hex => {
  return (saltOption as Hex) ?? DEFAULT_SALT;
};

// Known role constant names across all contract ABIs.
// Must be kept in sync with role constants in abi/ when new roles are added.
const KNOWN_ROLE_NAMES = new Set([
  // Common
  'DEFAULT_ADMIN_ROLE',
  // Pool / Strategy
  'ALLOW_LIST_MANAGER_ROLE',
  'DEPOSITS_PAUSE_ROLE',
  'DEPOSITS_RESUME_ROLE',
  'DEPOSIT_ROLE',
  'MINTING_PAUSE_ROLE',
  'MINTING_RESUME_ROLE',
  'LOSS_SOCIALIZER_ROLE',
  // Withdrawal Queue
  'FINALIZE_ROLE',
  'FINALIZE_PAUSE_ROLE',
  'FINALIZE_RESUME_ROLE',
  'WITHDRAWALS_PAUSE_ROLE',
  'WITHDRAWALS_RESUME_ROLE',
  // Distributor
  'MANAGER_ROLE',
  // TimeLock
  'PROPOSER_ROLE',
  'EXECUTOR_ROLE',
  'CANCELLER_ROLE',
  // Dashboard
  'BURN_ROLE',
  'COLLECT_VAULT_ERC20_ROLE',
  'FUND_ROLE',
  'MINT_ROLE',
  'NODE_OPERATOR_FEE_EXEMPT_ROLE',
  'NODE_OPERATOR_MANAGER_ROLE',
  'NODE_OPERATOR_PROVE_UNKNOWN_VALIDATOR_ROLE',
  'NODE_OPERATOR_UNGUARANTEED_DEPOSIT_ROLE',
  'PAUSE_BEACON_CHAIN_DEPOSITS_ROLE',
  'REBALANCE_ROLE',
  'REQUEST_VALIDATOR_EXIT_ROLE',
  'RESUME_BEACON_CHAIN_DEPOSITS_ROLE',
  'TRIGGER_VALIDATOR_WITHDRAWAL_ROLE',
  'VAULT_CONFIGURATION_ROLE',
  'VOLUNTARY_DISCONNECT_ROLE',
  'WITHDRAW_ROLE',
]);

// Helper function to resolve role
export const resolveRole = async (
  roleInput: string,
  contract: GetContractReturnType<Abi, PublicClient>,
): Promise<Hex> => {
  if (isHash(roleInput)) return roleInput;

  if (!KNOWN_ROLE_NAMES.has(roleInput)) {
    throw new Error(
      `Unknown role name "${roleInput}". Valid role names: ${[...KNOWN_ROLE_NAMES].join(', ')}`,
    );
  }

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
      `Failed to resolve role "${roleInput}". The contract may not support this role.`,
    );
  }
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
): Promise<Hex> => {
  const timelockContract = await getTimeLockContract(timelock);
  const minDelay = await callReadMethodSilent({
    contract: timelockContract,
    methodName: 'getMinDelay',
    payload: [],
  });

  const predecessor = DEFAULT_PREDECESSOR;

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
