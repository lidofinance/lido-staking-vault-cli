/**
 * End-to-end regression test for the balanceAwareTransport fix.
 *
 * Verifies that stateOverride is injected into eth_estimateGas even when the
 * call originates from contract.write[method]() — the path that bypassed the
 * old client.extend() override due to viem's bound-method closure bug.
 *
 * Uses real viem (createWalletClient, getContract, writeContract) with a mock
 * at the fetch level so we can inspect the exact JSON-RPC payload sent to the
 * node without needing a live chain.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createWalletClient, getContract, parseAbi, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { balanceAwareTransport } from '../../providers/wallet.js';

const MAX_UINT256_HEX =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const TEST_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const MOCK_CHAIN: Chain = {
  id: 1337,
  name: 'mocknet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['http://localhost:8545'] } },
};

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const RECIPIENT = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

const ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
]);

// Helpers -------------------------------------------------------------------

const jsonRpc = (id: number, result: unknown) =>
  Response.json(
    { jsonrpc: '2.0', id, result },
    { headers: { 'Content-Type': 'application/json' } },
  );

/**
 * Builds a fetch mock that answers every RPC call viem makes during
 * contract.write (chainId, nonce, fee estimation, gas estimation, sendTx).
 *
 * The capturedEstimateGasCalls array is populated with the full JSON-RPC
 * body of every eth_estimateGas request so the test can assert on it.
 */
const buildFetchMock = (capturedEstimateGasCalls: unknown[]) =>
  vi.fn(async (_url: string, init?: RequestInit) => {
    const body = JSON.parse((init?.body as string) ?? '{}');
    const { id, method } = body;

    switch (method) {
      case 'eth_chainId': {
        return jsonRpc(id, `0x${MOCK_CHAIN.id.toString(16)}`);
      }

      case 'eth_getTransactionCount': {
        return jsonRpc(id, '0x0');
      }

      // EIP-1559 fee history used by prepareTransactionRequest
      case 'eth_feeHistory': {
        return jsonRpc(id, {
          baseFeePerGas: ['0x1', '0x1'],
          gasUsedRatio: [0.5],
          reward: [['0x1']],
          oldestBlock: '0x1',
        });
      }

      case 'eth_getBlockByNumber': {
        return jsonRpc(id, {
          baseFeePerGas: '0x1',
          number: '0x1',
          hash: `0x${'a'.repeat(64)}`,
          transactions: [],
        });
      }

      case 'eth_maxPriorityFeePerGas': {
        return jsonRpc(id, '0x1');
      }

      case 'eth_estimateGas': {
        capturedEstimateGasCalls.push(body);
        return jsonRpc(id, '0x5208');
      }

      case 'eth_sendRawTransaction': {
        return jsonRpc(id, `0x${'b'.repeat(64)}`);
      }

      default: {
        return jsonRpc(id, null);
      }
    }
  });

// Tests ---------------------------------------------------------------------

describe('contract.write — stateOverride injected via balanceAwareTransport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('eth_estimateGas called by contract.write includes stateOverride for the sender', async () => {
    const capturedEstimateGasCalls: any[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      buildFetchMock(capturedEstimateGasCalls) as typeof fetch,
    );

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);

    const client = createWalletClient({
      account,
      chain: MOCK_CHAIN,
      transport: balanceAwareTransport('http://localhost:8545'),
    });

    const contract = getContract({
      client,
      abi: ERC20_ABI,
      address: CONTRACT_ADDRESS,
    });

    // This is the exact path that was broken: viem's bound writeContract →
    // sendTransaction → prepareTransactionRequest → estimateGas never reached
    // the client.extend() override. With transport-level interception it works.
    await contract.write.transfer([RECIPIENT, 100n]);

    expect(capturedEstimateGasCalls).toHaveLength(1);

    const estimateGasParams = capturedEstimateGasCalls[0].params;
    // params[0] = tx object, params[1] = blockTag, params[2] = stateOverride
    expect(estimateGasParams).toHaveLength(3);
    expect(estimateGasParams[2]).toMatchObject({
      [account.address]: { balance: MAX_UINT256_HEX },
    });
  });

  it('walletClient.sendTransaction also injects stateOverride (non-contract path)', async () => {
    const capturedEstimateGasCalls: any[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      buildFetchMock(capturedEstimateGasCalls) as typeof fetch,
    );

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);

    const client = createWalletClient({
      account,
      chain: MOCK_CHAIN,
      transport: balanceAwareTransport('http://localhost:8545'),
    });

    await client.sendTransaction({
      to: RECIPIENT,
      value: 0n,
    });

    expect(capturedEstimateGasCalls).toHaveLength(1);

    const estimateGasParams = capturedEstimateGasCalls[0].params;
    expect(estimateGasParams).toHaveLength(3);
    expect(estimateGasParams[2]).toMatchObject({
      [account.address]: { balance: MAX_UINT256_HEX },
    });
  });
});
