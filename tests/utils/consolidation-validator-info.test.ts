import { describe, it, expect } from 'vitest';
import { parseGwei, type Hex } from 'viem';
import { getTargetAndSourceValidatorsInfo } from '../../utils/consolidation/validator-info.js';
import {
  VALID_PUBKEY_1,
  VALID_PUBKEY_2,
  VALID_PUBKEY_3,
  VALID_PUBKEY_4,
  createCLValidatorData,
  createValidatorsInfo,
} from '../fixtures/consolidation-fixtures.js';

describe('getTargetAndSourceValidatorsInfo', () => {
  it('should create correct map from matched pubkeys', () => {
    const targetPubkeys = [VALID_PUBKEY_1];
    const sourcePubkeys = [[VALID_PUBKEY_2]];

    const targetValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0200000000000000000000000000000000000000000000000000000000000001',
        balance: '32000000000',
        effective_balance: '32000000000',
        index: '100',
        status: 'active_ongoing',
      }),
    ]);

    const sourceValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_2, {
        withdrawal_credentials:
          '0x0100000000000000000000000000000000000000000000000000000000000001',
        balance: '31500000000',
        effective_balance: '31000000000',
        index: '200',
        status: 'active_ongoing',
      }),
    ]);

    const result = getTargetAndSourceValidatorsInfo(
      targetPubkeys,
      targetValidatorsInfo,
      sourcePubkeys,
      sourceValidatorsInfo,
    );

    expect(result.size).toBe(1);
    const entry = result.get(VALID_PUBKEY_1);
    expect(entry).toBeDefined();
    if (!entry) return;
    expect(entry.info.status).toBe('active_ongoing');
    expect(entry.info.balance).toBe(parseGwei('32000000000'));
    expect(entry.info.index).toBe('100');
    expect(entry.sourceValidators.size).toBe(1);

    const sourceEntry = entry.sourceValidators.get(VALID_PUBKEY_2);
    expect(sourceEntry).toBeDefined();
    if (!sourceEntry) return;
    expect(sourceEntry.status).toBe('active_ongoing');
    expect(sourceEntry.balance).toBe(parseGwei('31500000000'));
    expect(sourceEntry.index).toBe('200');
  });

  it('should throw when target pubkey not found in targetValidatorsInfo', () => {
    const targetPubkeys = [VALID_PUBKEY_1];
    const sourcePubkeys = [[VALID_PUBKEY_2]];

    const targetValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_3), // wrong pubkey
    ]);
    const sourceValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_2),
    ]);

    expect(() =>
      getTargetAndSourceValidatorsInfo(
        targetPubkeys,
        targetValidatorsInfo,
        sourcePubkeys,
        sourceValidatorsInfo,
      ),
    ).toThrow(`Target validator with pubkey ${VALID_PUBKEY_1} not found`);
  });

  it('should throw when source pubkey not found in sourceValidatorsInfo', () => {
    const targetPubkeys = [VALID_PUBKEY_1];
    const sourcePubkeys = [[VALID_PUBKEY_2]];

    const targetValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_1),
    ]);
    const sourceValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_3), // wrong pubkey
    ]);

    expect(() =>
      getTargetAndSourceValidatorsInfo(
        targetPubkeys,
        targetValidatorsInfo,
        sourcePubkeys,
        sourceValidatorsInfo,
      ),
    ).toThrow(`Source validator with pubkey ${VALID_PUBKEY_2} not found`);
  });

  it('should handle multiple targets with multiple source groups', () => {
    const targetPubkeys = [VALID_PUBKEY_1, VALID_PUBKEY_3];
    const sourcePubkeys = [[VALID_PUBKEY_2], [VALID_PUBKEY_4]];

    const targetValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_1, { index: '1' }),
      createCLValidatorData(VALID_PUBKEY_3, { index: '2' }),
    ]);
    const sourceValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_2, { index: '10' }),
      createCLValidatorData(VALID_PUBKEY_4, { index: '20' }),
    ]);

    const result = getTargetAndSourceValidatorsInfo(
      targetPubkeys,
      targetValidatorsInfo,
      sourcePubkeys,
      sourceValidatorsInfo,
    );

    expect(result.size).toBe(2);
    expect(result.get(VALID_PUBKEY_1)?.sourceValidators.size).toBe(1);
    expect(result.get(VALID_PUBKEY_3)?.sourceValidators.size).toBe(1);
  });

  it('should handle empty pubkey arrays', () => {
    const targetValidatorsInfo = createValidatorsInfo([]);
    const sourceValidatorsInfo = createValidatorsInfo([]);

    const result = getTargetAndSourceValidatorsInfo(
      [],
      targetValidatorsInfo,
      [],
      sourceValidatorsInfo,
    );

    expect(result.size).toBe(0);
  });

  it('should handle target with empty source group', () => {
    const targetPubkeys = [VALID_PUBKEY_1];
    const sourcePubkeys: Hex[][] = [[]];

    const targetValidatorsInfo = createValidatorsInfo([
      createCLValidatorData(VALID_PUBKEY_1),
    ]);
    const sourceValidatorsInfo = createValidatorsInfo([]);

    const result = getTargetAndSourceValidatorsInfo(
      targetPubkeys,
      targetValidatorsInfo,
      sourcePubkeys,
      sourceValidatorsInfo,
    );

    expect(result.size).toBe(1);
    expect(result.get(VALID_PUBKEY_1)?.sourceValidators.size).toBe(0);
  });
});
