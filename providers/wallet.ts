import { readFileSync } from 'fs';
import {
  createPublicClient,
  createWalletClient,
  http,
  WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Wallet } from 'ethers';

import { envs, getConfig, getChainId, getElUrl, getChain } from 'configs';

const getPrivateKey = () => {
  const { PRIVATE_KEY, ACCOUNT_FILE, ACCOUNT_FILE_PASSWORD } = getConfig();
  const id = getChainId();

  if (PRIVATE_KEY && ACCOUNT_FILE) {
    throw new Error(
      'You must provide only one of the following: private key or encrypted account file',
    );
  }

  if (PRIVATE_KEY) {
    return PRIVATE_KEY;
  }

  if (envs?.[`PRIVATE_KEY_${id}`]) {
    return envs[`PRIVATE_KEY_${id}`];
  }

  if (ACCOUNT_FILE) {
    if (!ACCOUNT_FILE_PASSWORD) {
      throw new Error('Account file password is not provided');
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const file = readFileSync(ACCOUNT_FILE, 'utf-8');
    const fileContent = JSON.parse(file);
    const privateKey = Wallet.fromEncryptedJsonSync(
      JSON.stringify(fileContent),
      ACCOUNT_FILE_PASSWORD,
    ).privateKey;

    return privateKey;
  }

  throw new Error('Private key or encrypted account file is not provided');
};

export const getAccount = () => {
  const id = getChainId();
  const privateKey = getPrivateKey();

  if (!privateKey) {
    throw new Error(`Private key for ${id} chain is not set`);
  }

  return privateKeyToAccount(privateKey);
};

export const getPublicClient = () => {
  return createPublicClient({
    chain: getChain(),
    transport: http(getElUrl()),
  });
};

export const getWalletWithAccount = (): WalletClient => {
  const account = getAccount();
  return createWalletClient({
    account,
    chain: getChain(),
    transport: http(getElUrl()),
  });
};
