import type { Hex } from 'viem';
import type {
  TargetAndSourceValidators,
  ValidatorInfo,
} from '../../utils/consolidation/types.js';

// Valid 48-byte pubkeys (96 hex chars after 0x)
export const VALID_PUBKEY_1 = ('0x' + 'aa'.repeat(48)) as Hex;
export const VALID_PUBKEY_2 = ('0x' + 'bb'.repeat(48)) as Hex;
export const VALID_PUBKEY_3 = ('0x' + 'cc'.repeat(48)) as Hex;
export const VALID_PUBKEY_4 = ('0x' + 'dd'.repeat(48)) as Hex;
export const ZERO_PUBKEY = ('0x' + '00'.repeat(48)) as Hex;

// Invalid pubkeys for testing validation
export const SHORT_PUBKEY = ('0x' + 'aa'.repeat(47)) as Hex;

// Valid addresses
export const VALID_DASHBOARD =
  '0x318FcB0CCE93aBA9C21a1B4B38dbACcCEfF091E0' as Hex;
export const VALID_REFUND_RECIPIENT =
  '0x463f500FCb218d38FB35BECD20475ea75a79B7A9' as Hex;
export const ZERO_ADDRESS =
  '0x0000000000000000000000000000000000000000' as Hex;

export const createValidatorInfo = (
  overrides: Partial<ValidatorInfo> = {},
): ValidatorInfo => ({
  status: 'active_ongoing',
  balance: 32000000000n,
  index: '1',
  effectiveBalance: 32000000000n,
  ...overrides,
});

export const createTargetAndSourceMap = (
  entries: Array<{
    target: Hex;
    targetInfo?: Partial<ValidatorInfo>;
    sources: Array<{ pubkey: Hex; info?: Partial<ValidatorInfo> }>;
  }>,
): TargetAndSourceValidators => {
  const map: TargetAndSourceValidators = new Map();
  for (const entry of entries) {
    const sourceValidators = new Map<Hex, ValidatorInfo>();
    for (const source of entry.sources) {
      sourceValidators.set(source.pubkey, createValidatorInfo(source.info));
    }
    map.set(entry.target, {
      info: createValidatorInfo(entry.targetInfo),
      sourceValidators,
    });
  }
  return map;
};

// CL ValidatorsInfo mock data builder
export const createCLValidatorData = (
  pubkey: string,
  overrides: {
    withdrawal_credentials?: string;
    activation_epoch?: string;
    status?: string;
    balance?: string;
    effective_balance?: string;
    index?: string;
    slashed?: boolean;
    exit_epoch?: string;
    withdrawable_epoch?: string;
  } = {},
) => ({
  index: overrides.index ?? '1',
  balance: overrides.balance ?? '32000000000',
  status: overrides.status ?? 'active_ongoing',
  validator: {
    pubkey,
    withdrawal_credentials:
      overrides.withdrawal_credentials ??
      '0x0100000000000000000000000000000000000000000000000000000000000001',
    effective_balance: overrides.effective_balance ?? '32000000000',
    slashed: overrides.slashed ?? false,
    activation_eligibility_epoch: '0',
    activation_epoch: overrides.activation_epoch ?? '0',
    exit_epoch: overrides.exit_epoch ?? '18446744073709551615',
    withdrawable_epoch:
      overrides.withdrawable_epoch ?? '18446744073709551615',
  },
});

export const createValidatorsInfo = (
  validators: ReturnType<typeof createCLValidatorData>[],
) => ({
  execution_optimistic: false,
  finalized: true,
  data: validators,
});
