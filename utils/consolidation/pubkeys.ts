import { bytesToHex, Hex, hexToBytes } from 'viem';

import { TargetAndSourceValidators } from './types.js';

export const flattenSourcePubkeys = (
  targetAndSourceValidators: TargetAndSourceValidators,
): `0x${string}`[] => {
  const targetPubkeys = [...targetAndSourceValidators.keys()];
  return targetPubkeys.map((target) => {
    const sourceMap = targetAndSourceValidators.get(target);
    if (!sourceMap) {
      throw new Error(`Target validator ${target} not found in map`);
    }

    const merged = [...sourceMap.sourceValidators.keys()]
      .map((p) => p.replace(/^0x/, ''))
      .join('');

    return `0x${merged}`;
  }) as `0x${string}`[];
};

export const getSourceAndTargetPubkeysFromEncodedCall = (
  encodedCall: Hex,
): { sourcePubkey: Hex; targetPubkey: Hex } => {
  const encodedCallBytes = hexToBytes(encodedCall);
  const sourcePubkey = bytesToHex(
    encodedCallBytes.slice(0, encodedCallBytes.length / 2),
  );
  const targetPubkey = bytesToHex(
    encodedCallBytes.slice(encodedCallBytes.length / 2),
  );

  return { sourcePubkey, targetPubkey };
};

export const addDummyTargetAndSourceValidator = (
  targetAndSourceValidators: TargetAndSourceValidators,
  feeExemption: bigint,
) => {
  targetAndSourceValidators.set(
    '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    {
      info: {
        status: 'active_ongoing',
        balance: feeExemption,
        index: '0',
      },
      sourceValidators: new Map([
        [
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
          {
            status: 'active_ongoing',
            balance: feeExemption,
            index: '0',
          },
        ],
      ]),
    },
  );
};
