import { describe, test, expect, beforeAll } from 'vitest';
import { type Hex } from 'viem';
import { checkValidatorInfo, checkPdgIsPaused } from 'features';
import {
  getPredepositGuaranteeContract,
  PredepositGuaranteeContract,
} from 'contracts/pdg.js';
import { loadTestConfig } from './helpers/test-config.js';
import { setupIntegrationTestsBeforeEach } from './helpers/test-setup.js';

describe('Deposits Integration Tests', () => {
  setupIntegrationTestsBeforeEach();

  let pdgContract: PredepositGuaranteeContract;

  beforeAll(async () => {
    loadTestConfig();
    pdgContract = await getPredepositGuaranteeContract();
  });

  test('should check PDG is paused status', async () => {
    const isPaused = await checkPdgIsPaused(pdgContract);

    expect(typeof isPaused).toBe('boolean');
    // PDG can be paused or not, both are valid states
  });

  test('should validate validator info with valid data', async () => {
    const validValidator = {
      pubkey: ('0x' + '0'.repeat(96)) as Hex,
      effectiveBalance: 32000000000, // 32 ETH in gwei
      activationEpoch: 0,
      slashed: false,
    };

    const result = await checkValidatorInfo(validValidator);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('skip');
    expect(typeof result.isValid).toBe('boolean');
    expect(typeof result.skip).toBe('boolean');
  });

  test('should handle validator with low effective balance', async () => {
    const invalidValidator = {
      pubkey: ('0x' + '0'.repeat(96)) as Hex,
      effectiveBalance: 1000000000, // Less than 32 ETH
      activationEpoch: 0,
      slashed: false,
    };

    const { isValid, skip } = await checkValidatorInfo(invalidValidator);

    // Either result is defined or error is thrown
    expect(isValid).toBe(false);
    expect(skip).toBe(true);
  });

  test('should handle validator that is not activated', async () => {
    const notActivatedValidator = {
      pubkey: ('0x' + '0'.repeat(96)) as Hex,
      effectiveBalance: 32000000000,
      activationEpoch: Infinity, // Not activated
      slashed: false,
    };

    const { isValid, skip } = await checkValidatorInfo(notActivatedValidator);

    expect(isValid).toBe(false);
    expect(skip).toBe(true);
  });

  test('should handle slashed validator', async () => {
    const slashedValidator = {
      pubkey: ('0x' + '0'.repeat(96)) as Hex,
      effectiveBalance: 32000000000,
      activationEpoch: 0,
      slashed: true,
    };

    const { isValid, skip } = await checkValidatorInfo(slashedValidator);

    expect(isValid).toBe(false);
    expect(skip).toBe(true);
  });
});
