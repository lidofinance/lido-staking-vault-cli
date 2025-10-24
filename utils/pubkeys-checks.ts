import { Hex, hexToBytes, isHex } from 'viem';

export const checkPubkeys = (pubkeys: Hex[]) => {
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
