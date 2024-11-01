import { Address, Chain, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { envs } from "@configs";

const getWalletClient = (chainId: Chain) => {
  const rpcUrl = envs?.[`RPC_URL_${chainId}`];

  const client = createWalletClient({
    chain: chainId,
    transport: http(rpcUrl),
  });

  return client;
};

export const getAccount = (chainId: Chain) => {
  const privateKey = envs?.[`PRIVATE_KEY_${chainId}`];

  if (!privateKey) {
    throw new Error(`PRIVATE_KEY_${chainId} is not set`);
  }

  const account = privateKeyToAccount(privateKey as Address);

  return account;
};
