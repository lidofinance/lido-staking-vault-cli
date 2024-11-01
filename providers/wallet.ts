import { Address, Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { envs } from "@configs";

export const getWalletClient = (chainId?: Chain) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId || process.env.CHAIN_ID}`];

  const client = createWalletClient({
    chain: chainId,
    transport: http(rpcUrl),
  });

  return client;
};

export const getAccount = (chainId?: Chain) => {
  const privateKey = envs?.[`PRIVATE_KEY_${chainId || process.env.CHAIN_ID}`];

  if (!privateKey) {
    throw new Error(`PRIVATE_KEY_${chainId} is not set`);
  }

  const account = privateKeyToAccount(privateKey as Address);

  return account;
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
