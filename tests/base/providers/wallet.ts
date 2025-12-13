import {
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

export const getClient = () =>
  createPublicClient({
    chain: getChain(),
    transport: http(getElUrl()),
  });
