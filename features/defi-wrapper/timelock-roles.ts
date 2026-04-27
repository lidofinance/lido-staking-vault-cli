import {
  Address,
  encodeFunctionData,
  Hex,
  GetContractReturnType,
  Abi,
  PublicClient,
  isHash,
} from 'viem';

import {
  processSalt,
  promptStrategy,
  promptAccount,
  promptRole,
  logInfo,
  callReadMethodSilent,
} from 'utils';

import {
  proposeOperation,
  executeOperation,
  getPromptTimelock,
} from './timelock.js';

export const createRoleAction = (
  mode: 'propose' | 'execute',
  roleFunction: 'grantRole' | 'revokeRole',
  accountPromptMessage: string,
) => {
  const verb = roleFunction === 'grantRole' ? 'granting' : 'revoking';
  const preposition = roleFunction === 'grantRole' ? 'to' : 'from';
  const timelockFn = mode === 'propose' ? proposeOperation : executeOperation;

  return async (
    timelock?: Address,
    strategyAddress?: Address,
    roleInput?: string,
    accountInput?: string,
    options?: { salt?: Hex },
  ) => {
    const timelockContract = await getPromptTimelock(timelock);
    const strategyContract = await promptStrategy(strategyAddress);
    const role = await promptRole(roleInput, strategyContract);
    const finalSalt = processSalt(options?.salt);
    const account = await promptAccount(accountInput, accountPromptMessage);

    const data = encodeFunctionData({
      abi: strategyContract.abi,
      functionName: roleFunction,
      args: [role, account],
    });

    await timelockFn(
      timelockContract.address,
      strategyContract.address,
      data,
      finalSalt,
      roleFunction,
      `Are you sure you want to ${mode} ${verb} role ${role} ${preposition} ${account} on strategy ${strategyContract.address}?`,
    );
  };
};

const ROLE_NAME_PATTERN = /^[A-Z][A-Z0-9_]*_ROLE$/;

// Helper function to resolve role
export const resolveRole = async (
  roleInput: string,
  contract: GetContractReturnType<Abi, PublicClient>,
): Promise<Hex> => {
  if (isHash(roleInput)) return roleInput;

  if (!ROLE_NAME_PATTERN.test(roleInput)) {
    throw new Error(
      `Invalid role name "${roleInput}". Role names must match pattern *_ROLE (e.g., DEFAULT_ADMIN_ROLE) or be a bytes32 hex.`,
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
      `Failed to resolve role "${roleInput}". Please provide a valid role name (e.g., DEFAULT_ADMIN_ROLE) or bytes32 hex.`,
    );
  }
};
