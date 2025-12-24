import {
  Address,
  createPublicClient,
  createTestClient,
  formatEther,
  http,
  publicActions,
  walletActions,
} from 'viem';
import { getChain, getElUrl } from '../config';

const HTTP_TIMEOUT = process.env.CI ? 180_000 : 120_000;

export const getTestClient = () =>
  createTestClient({
    chain: getChain(),
    mode: 'anvil',
    transport: http(getElUrl(), {
      timeout: HTTP_TIMEOUT,
      batch: {
        wait: 100,
      },
    }),
  })
    .extend(publicActions)
    .extend(walletActions);

export const getBalanceEth = async (address: Address) => {
  const testClient = getTestClient();
  return formatEther(await testClient.getBalance({ address: address }));
};

export const getClient = () =>
  createPublicClient({
    chain: getChain(),
    transport: http(getElUrl(), {
      timeout: HTTP_TIMEOUT,
      batch: {
        wait: 100,
      },
    }),
  });

export const jumpForward = async (seconds: number) => {
  const testClient = getTestClient();
  await testClient.increaseTime({ seconds });
  await testClient.mine({ blocks: 1 });
};
