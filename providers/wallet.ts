import { Address, createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { envs, getConfig, getChainId, getElUrl, getChain } from 'configs';

export const getAccount = () => {
  const config = getConfig();
  const id = getChainId();
  const privateKey = config?.PRIVATE_KEY ?? envs?.[`PRIVATE_KEY_${id}`];

  if (!privateKey) {
    throw new Error(`Private key for ${id} chain is not set`);
  }

  return privateKeyToAccount(privateKey as Address);
};

export const getPublicClient = () => {
  return createPublicClient({
    chain: getChain(),
    transport: http(getElUrl()),
  });
};

export const getWalletWithAccount = () => {
  const account = getAccount();
  return createWalletClient({
    account,
    chain: getChain(),
    transport: http(getElUrl()),
  });
};
