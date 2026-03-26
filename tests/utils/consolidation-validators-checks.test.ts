import { describe, it, expect } from 'vitest';
import {
  checkSourceValidators,
  checkTargetValidators,
  removeInactiveValidators,
} from '../../utils/consolidation/validators-checks.js';
import {
  VALID_PUBKEY_1,
  VALID_PUBKEY_2,
  VALID_PUBKEY_3,
  VALID_PUBKEY_4,
  createTargetAndSourceMap,
  createCLValidatorData,
} from '../fixtures/consolidation-fixtures.js';

describe('checkSourceValidators', () => {
  const FINALIZED_EPOCH = 1000;

  it('should pass with valid 0x01 withdrawal credentials and sufficient epochs', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0100000000000000000000000000000000000000000000000000000000000001',
        activation_epoch: '0',
      }),
    ];
    expect(() =>
      checkSourceValidators(validators, FINALIZED_EPOCH),
    ).not.toThrow();
  });

  it('should pass with valid 0x02 withdrawal credentials', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0200000000000000000000000000000000000000000000000000000000000001',
        activation_epoch: '0',
      }),
    ];
    expect(() =>
      checkSourceValidators(validators, FINALIZED_EPOCH),
    ).not.toThrow();
  });

  it('should throw when withdrawal credentials start with 0x00', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        activation_epoch: '0',
      }),
    ];
    expect(() => checkSourceValidators(validators, FINALIZED_EPOCH)).toThrow(
      'All source pubkeys must have a withdrawal credentials starting with 0x01 or 0x02',
    );
  });

  it('should throw when activation epoch is less than 256 epochs before finalized', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0100000000000000000000000000000000000000000000000000000000000001',
        activation_epoch: '900', // 1000 - 900 = 100, less than 256
      }),
    ];
    expect(() => checkSourceValidators(validators, FINALIZED_EPOCH)).toThrow(
      'activation epoch less than the finalized epoch by at least 256 epochs',
    );
  });

  it('should pass with empty array', () => {
    expect(() => checkSourceValidators([], FINALIZED_EPOCH)).not.toThrow();
  });

  it('should list all invalid pubkeys in error message', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        activation_epoch: '0',
      }),
      createCLValidatorData(VALID_PUBKEY_2, {
        withdrawal_credentials:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        activation_epoch: '0',
      }),
    ];
    expect(() => checkSourceValidators(validators, FINALIZED_EPOCH)).toThrow(
      new RegExp(`${VALID_PUBKEY_1}.*${VALID_PUBKEY_2}|${VALID_PUBKEY_2}.*${VALID_PUBKEY_1}`),
    );
  });
});

describe('checkTargetValidators', () => {
  it('should pass with 0x02 withdrawal credentials', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0200000000000000000000000000000000000000000000000000000000000001',
      }),
    ];
    expect(() => checkTargetValidators(validators)).not.toThrow();
  });

  it('should throw when withdrawal credentials start with 0x01', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0100000000000000000000000000000000000000000000000000000000000001',
      }),
    ];
    expect(() => checkTargetValidators(validators)).toThrow(
      'All target pubkeys must have a withdrawal credentials starting with 0x02',
    );
  });

  it('should throw when withdrawal credentials start with 0x00', () => {
    const validators = [
      createCLValidatorData(VALID_PUBKEY_1, {
        withdrawal_credentials:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      }),
    ];
    expect(() => checkTargetValidators(validators)).toThrow(
      'All target pubkeys must have a withdrawal credentials starting with 0x02',
    );
  });

  it('should pass with empty array', () => {
    expect(() => checkTargetValidators([])).not.toThrow();
  });
});

describe('removeInactiveValidators', () => {
  it('should remove source validators with non-active_ongoing status', () => {
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          { pubkey: VALID_PUBKEY_2, info: { status: 'active_ongoing' } },
          { pubkey: VALID_PUBKEY_3, info: { status: 'exited' } },
        ],
      },
    ]);
    removeInactiveValidators(map);
    expect(map.size).toBe(1);
    const entry = map.get(VALID_PUBKEY_1);
    expect(entry?.sourceValidators.size).toBe(1);
    expect(entry?.sourceValidators.has(VALID_PUBKEY_2)).toBe(true);
    expect(entry?.sourceValidators.has(VALID_PUBKEY_3)).toBe(false);
  });

  it('should remove target entries when all sources are removed', () => {
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          { pubkey: VALID_PUBKEY_2, info: { status: 'exited' } },
          { pubkey: VALID_PUBKEY_3, info: { status: 'withdrawal_done' } },
        ],
      },
    ]);
    removeInactiveValidators(map);
    expect(map.size).toBe(0);
  });

  it('should preserve active validators', () => {
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          { pubkey: VALID_PUBKEY_2, info: { status: 'active_ongoing' } },
        ],
      },
    ]);
    removeInactiveValidators(map);
    expect(map.size).toBe(1);
    expect(map.get(VALID_PUBKEY_1)?.sourceValidators.size).toBe(1);
  });

  it('should handle empty map', () => {
    const map = createTargetAndSourceMap([]);
    removeInactiveValidators(map);
    expect(map.size).toBe(0);
  });

  it('should handle multiple targets independently', () => {
    const map = createTargetAndSourceMap([
      {
        target: VALID_PUBKEY_1,
        sources: [
          { pubkey: VALID_PUBKEY_2, info: { status: 'active_ongoing' } },
        ],
      },
      {
        target: VALID_PUBKEY_3,
        sources: [{ pubkey: VALID_PUBKEY_4, info: { status: 'exited' } }],
      },
    ]);
    removeInactiveValidators(map);
    expect(map.size).toBe(1);
    expect(map.has(VALID_PUBKEY_1)).toBe(true);
    expect(map.has(VALID_PUBKEY_3)).toBe(false);
  });
});
