import {
  type Address,
  createTestClient,
  http,
  publicActions,
  walletActions,
  createWalletClient,
  parseEther,
} from 'viem';
import { logInfo, callReadMethodSilent } from 'utils';
import { getChain, getElUrl } from 'configs';

export const grantRoleFromImpersonatedAccount = async ({
  currentAccount,
  contract,
  impersonateAccount,
  role,
  roleName,
}: {
  currentAccount: Address;
  contract: any;
  impersonateAccount: Address;
  role: string;
  roleName: string;
}) => {
  const testClient = createTestClient({
    chain: await getChain(),
    mode: 'anvil',
    transport: http(getElUrl()),
  })
    .extend(publicActions)
    .extend(walletActions);

  await testClient.impersonateAccount({
    address: impersonateAccount,
  });
  await testClient.setBalance({
    address: impersonateAccount,
    value: parseEther('10'),
  });

  const walletClient = createWalletClient({
    account: impersonateAccount,
    chain: await getChain(),
    transport: http(getElUrl()),
  });

  logInfo(`Granting ${roleName} to account...`);

  await walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: 'grantRole',
    args: [role, currentAccount],
  });

  const roleMembersAfter = await callReadMethodSilent({
    contract: contract,
    methodName: 'getRoleMembers',
    payload: [[role]],
  });
  logInfo('Role members after granting: ', roleMembersAfter);
  if (!roleMembersAfter.includes(currentAccount)) {
    logInfo(`Address ${currentAccount} does not have the ${roleName} role`);
    return;
  }

  logInfo(`${roleName} granted successfully`);
};

export const callMethodFromImpersonatedAccount = async ({
  contract,
  functionName,
  args,
  impersonateAccount,
}: {
  contract: any;
  functionName: string;
  args: any[];
  impersonateAccount: Address;
}) => {
  const testClient = createTestClient({
    chain: await getChain(),
    mode: 'anvil',
    transport: http(getElUrl()),
  })
    .extend(publicActions)
    .extend(walletActions);

  await testClient.impersonateAccount({
    address: impersonateAccount,
  });

  const walletClient = createWalletClient({
    account: impersonateAccount,
    chain: await getChain(),
    transport: http(getElUrl()),
  });

  logInfo(`Calling ${functionName} with args ${args}...`);

  await walletClient.writeContract({
    address: contract.address,
    abi: contract.abi,
    functionName: functionName,
    args: args,
  });

  logInfo(`${functionName} called successfully`);
};
