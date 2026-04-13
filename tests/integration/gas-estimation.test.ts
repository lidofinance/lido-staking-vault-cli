import { describe, test, expect, beforeAll } from 'vitest';
import { createPublicClient, http, parseEther, maxUint256 } from 'viem';
import { getChain } from 'configs';

import { loadTestConfig } from './helpers/test-config.js';
import {
  createAnvilTestClient,
  mintEth,
  getAccountFromPrivateKey,
} from './helpers/test-client.js';
import { setupIntegrationTestsBeforeEach } from './helpers/test-setup.js';

/**
 * Integration tests for the gas estimation stateOverride fix.
 *
 * Proves that stateOverride in eth_estimateGas allows accurate gas estimation
 * for low-balance accounts on a real Anvil fork.
 */

// Anvil's default account #1 (not the one used by the test suite)
const LOW_BALANCE_KEY =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

describe('gas estimation with stateOverride', () => {
  setupIntegrationTestsBeforeEach();

  let rpcUrl: string;
  let chainObj: Awaited<ReturnType<typeof getChain>>;

  beforeAll(async () => {
    const config = loadTestConfig();
    rpcUrl = config.EL_URL;
    chainObj = await getChain();
  });

  test('stateOverride: low-balance account succeeds with balance override', async () => {
    const testClient = createAnvilTestClient(chainObj, rpcUrl);
    const lowBalanceAccount = getAccountFromPrivateKey(LOW_BALANCE_KEY);

    await mintEth(testClient, lowBalanceAccount.address, parseEther('0.0001'));

    const publicClient = createPublicClient({
      chain: chainObj,
      transport: http(rpcUrl),
    });

    // With stateOverride — estimation succeeds regardless of real balance
    const gas = await publicClient.estimateGas({
      account: lowBalanceAccount,
      to: '0x0000000000000000000000000000000000000001',
      value: 0n,
      stateOverride: [
        {
          address: lowBalanceAccount.address,
          balance: maxUint256,
        },
      ],
    });

    expect(gas).toBeGreaterThan(0n);
    expect(gas).toBeLessThanOrEqual(100_000n);
  });

  test('contract interaction: estimateGas with stateOverride on ERC-20 approve', async () => {
    const testClient = createAnvilTestClient(chainObj, rpcUrl);
    const lowBalanceAccount = getAccountFromPrivateKey(LOW_BALANCE_KEY);

    await mintEth(testClient, lowBalanceAccount.address, parseEther('0.0001'));

    const publicClient = createPublicClient({
      chain: chainObj,
      transport: http(rpcUrl),
    });

    // ERC-20 approve(spender, amount) on WETH
    const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const approveData =
      '0x095ea7b3' +
      '000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef' +
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    const gas = await publicClient.estimateGas({
      account: lowBalanceAccount,
      to: WETH as `0x${string}`,
      data: approveData as `0x${string}`,
      stateOverride: [
        {
          address: lowBalanceAccount.address,
          balance: maxUint256,
        },
      ],
    });

    // approve() typically costs ~46k gas
    expect(gas).toBeGreaterThan(20_000n);
    expect(gas).toBeLessThan(200_000n);
  });
});
