import { Address, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { envs, getConfig, getChainId, getRpcUrl, getChain } from "@configs";

export const getWalletClient = (chainId?: number) => {
  const id = getChainId() ?? chainId;
  const rpcUrls = getRpcUrl() ?? envs?.[`RPC_URL_${id}`];
  const url = rpcUrls.split(',')[0];

  const client = createWalletClient({
    chain: getChain(id),
    transport: http(url),
  });

  return client;
};

export const getAccount = (chainId?: number) => {
  const config = getConfig();
  const id = chainId ?? getChainId();
  const privateKey = config?.privateKey ?? envs?.[`PRIVATE_KEY_${id}`];

  if (!privateKey) {
    throw new Error(`Private key for ${id} chain is not set`);
  }

  return privateKeyToAccount(privateKey as Address);
};

export const getWalletWithAccount = (chainId?: number) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId || process.env.CHAIN_ID}`];
  const id = chainId ?? getChainId();

  const account = getAccount(id);
  const client = createWalletClient({
    account,
    chain: getChain(id),
    transport: http(rpcUrl),
  });

  return { client, account };
};
