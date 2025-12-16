import {
  Address,
  createPublicClient,
  createTestClient,
  http,
  publicActions,
  walletActions,
} from 'viem';
import { getChain, getElUrl } from '../config';

export const getTestClient = () =>
  createTestClient({
    chain: getChain(),
    mode: 'anvil',
    transport: http(getElUrl()),
  })
    .extend(publicActions)
    .extend(walletActions);

export const getBalanceEth = async (address: Address) => {
  const testClient = getTestClient();
  return await testClient.getBalance({ address: address });
};

export const getClient = () =>
  createPublicClient({
    chain: getChain(),
    transport: http(getElUrl()),
  });

export const jumpForward = async (seconds: number) => {
  const testClient = getTestClient();
  await testClient.increaseTime({ seconds });
  await testClient.mine({ blocks: 1 });
};
