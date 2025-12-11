import { Address, Hex, hexToBytes, isHex, zeroAddress } from 'viem';
import { toHex } from 'utils';

import { PubkeyMap } from './types.js';

export const checkPubkeysArgs = (
  file: PubkeyMap,
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
) => {
  if (!file && !(sourcePubkeys && targetPubkeys)) {
    throw new Error(
      'Provide --file or both --source_pubkeys and --target_pubkeys',
    );
  }

  const currentSourcePubkeys = file
    ? (Object.values(file) as Hex[][])
    : (sourcePubkeys ?? []);
  const currentTargetPubkeys = file
    ? Object.keys(file).map(toHex)
    : (targetPubkeys ?? []);

  return {
    sourcePubkeys: currentSourcePubkeys,
    targetPubkeys: currentTargetPubkeys,
  };
};

export const validateConsolidationInput = (
  sourcePubkeys: Hex[][],
  targetPubkeys: Hex[],
  dashboard: Address,
  refundRecipient?: Address,
) => {
  const sourcePubkeysFlat = sourcePubkeys.flat();
  validatePubkeys(sourcePubkeysFlat);
  validatePubkeys(targetPubkeys);

  if (sourcePubkeys.length !== targetPubkeys.length) {
    throw new Error(
      'sourcePubkeys and targetPubkeys must have the same length',
    );
  }
  if (refundRecipient != null && refundRecipient === zeroAddress) {
    throw new Error('refundRecipient must be non-zero address');
  }
  if (dashboard === zeroAddress) {
    throw new Error('dashboard address must be non-zero address');
  }
};

const validatePubkeys = (pubkeys: Hex[]) => {
  const invalid = pubkeys.filter(
    (pubkey) =>
      !(
        typeof pubkey === 'string' &&
        isHex(pubkey) &&
        hexToBytes(pubkey).length === 48
      ),
  );
  if (invalid.length > 0) {
    throw new Error(
      'Invalid pubkeys (must be hex 0x + 48 bytes):\n' + invalid.join('\n'),
    );
  }
};
