import { readFileSync } from 'fs';
import { program } from 'command';
import {
  Address,
  createPublicClient,
  createWalletClient,
  http,
  WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { Keystore } from 'ox';

import { envs, getConfig, getChainId, getElUrl, getChain } from 'configs';
import { createWalletConnectClient } from 'utils';

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
    const fileContent: Keystore.Keystore = JSON.parse(file);

    const kdfType = fileContent.crypto.kdf;

    const [key] = Keystore[kdfType]({
      password: ACCOUNT_FILE_PASSWORD,
      ...fileContent.crypto.kdfparams,
      salt: `0x${fileContent.crypto.kdfparams.salt}`,
      iv: `0x${fileContent.crypto.cipherparams.iv}`,
    });
    const privateKey = Keystore.decrypt(fileContent, key);

    return privateKey;
  }

  throw new Error('Private key or encrypted account file is not provided');
};

export const getAccount = async () => {
  const id = getChainId();

  if (program.opts().walletConnect) {
    const walletConnectClient = await getWalletConnectClient();

    if (!walletConnectClient.account) {
      throw new Error('Wallet connect account is not found');
    }

    return walletConnectClient.account;
  }

  const privateKey = getPrivateKey();

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

export const getWalletWithAccount = async (): Promise<WalletClient> => {
  const account = await getAccount();
  return createWalletClient({
    account,
    chain: getChain(),
    transport: http(getElUrl()),
  });
};

export const getWalletConnectClient = async () => {
  const walletConnectClient = await createWalletConnectClient();

  return walletConnectClient;
};
