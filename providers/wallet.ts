import { Address, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { envs, getConfig, getChainId, getRpcUrl, getChain } from "@configs";

export const getWalletClient = () => {
  return createWalletClient({
    chain: getChain(),
    transport: http(getRpcUrl()),
  });
};

export const getAccount = () => {
  const config = getConfig();
  const id = getChainId();
  const privateKey = config?.privateKey ?? envs?.[`PRIVATE_KEY_${id}`];

  if (!privateKey) {
    throw new Error(`Private key for ${id} chain is not set`);
  }

  return privateKeyToAccount(privateKey as Address);
};

export const getWalletWithAccount = () => {
  const account = getAccount();
  const client = createWalletClient({
    account,
    chain: getChain(),
    transport: http(getRpcUrl()),
  });

  return { client, account };
};
