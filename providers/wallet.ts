import { Address, Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { envs } from "@configs";

export const getWalletClient = (chainId?: Chain) => {
  const currentChainId = chainId ?? process.env.CHAIN_ID;
  const rpcUrl = envs?.[`RPC_URL_${currentChainId}`];

  const client = createWalletClient({
    chain: chainId,
    transport: http(rpcUrl),
  });

  return client;
};

export const getAccount = (chainId?: Chain) => {
  const currentChainId = chainId ?? process.env.CHAIN_ID;
  const privateKey = envs?.[`PRIVATE_KEY_${currentChainId}`];

  if (!privateKey) {
    throw new Error(`PRIVATE_KEY_${chainId} is not set`);
  }

  const account = privateKeyToAccount(privateKey as Address);

  return account;
};

export const getWalletWithAccount = (chainId?: Chain) => {
  const currentChainId = chainId ?? process.env.CHAIN_ID;
  const rpcUrl = envs?.[`RPC_URL_${currentChainId}`];

  const account = getAccount(chainId);
  const client = createWalletClient({
    account,
    chain: chainId,
    transport: http(rpcUrl),
  });

  return { client, account };
};
