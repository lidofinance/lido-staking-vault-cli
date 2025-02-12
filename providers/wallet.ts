import { Address, createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { envs, getConfig, getChainId, getRpcUrl, getChain } from 'configs';

export const getAccount = () => {
  const config = getConfig();
  const id = getChainId();
  const privateKey = config?.privateKey ?? envs?.[`PRIVATE_KEY_${id}`];

  if (!privateKey) {
    throw new Error(`Private key for ${id} chain is not set`);
  }

  return privateKeyToAccount(privateKey as Address);
};

export const getPublicClient = () => {
  return createPublicClient({
    chain: getChain(),
    transport: http(getRpcUrl()),
  });
};

export const getWalletWithAccount = () => {
  const account = getAccount();
  const walletClient = createWalletClient({
    account,
    chain: getChain(),
    transport: http(getRpcUrl()),
  });

  const publicClient = getPublicClient();

  return { walletClient, publicClient, account };
};
