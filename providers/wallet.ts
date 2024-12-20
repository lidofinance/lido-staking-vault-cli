import { Address, Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {envs, getConfig, getChainId, getRpcUrl} from "@configs";

export const getWalletClient = (chainId?: Chain) => {
  const chain = getChainId() ?? chainId;
  const rpcUrls = getRpcUrl() ?? envs?.[`RPC_URL_${chain}`];
  const url = rpcUrls.split(',')[0];

  const client = createWalletClient({
    chain,
    transport: http(url),
  });

  return client;
};

export const getAccount = (chainId?: Chain) => {
  const config = getConfig();
  const chain = chainId ?? getChainId();
  const privateKey = config?.privateKey ?? envs?.[`PRIVATE_KEY_${chain}`];

  if (!privateKey) {
    throw new Error(`Private key for ${chain} chain is not set`);
  }

  return privateKeyToAccount(privateKey as Address);
};

export const getWalletWithAccount = (chainId?: Chain) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId || process.env.CHAIN_ID}`];

  const account = getAccount(chainId);
  const client = createWalletClient({
    account,
    chain: chainId,
    transport: http(rpcUrl),
  });

  return { client, account };
};
