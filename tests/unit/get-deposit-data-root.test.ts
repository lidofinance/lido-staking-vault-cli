import { describe, test, expect, jest } from '@jest/globals';

jest.mock('../../utils/proof/index.js', () =>
  require('../../utils/proof/merkle-utils.js'),
);
import { computeDepositDataRoot } from '../../utils/get-deposit-data-root.js';
import {
  fromHex,
  encodeGweiAsLittleEndian8,
  sha256Concat,
} from '../../utils/proof/merkle-utils.js';

const manual = (pubkey: string, wc: string, sig: string, amount: bigint) => {
  const pk = fromHex(pubkey);
  const wcBytes = fromHex(wc);
  const sigBytes = fromHex(sig);
  const amountLE64 = encodeGweiAsLittleEndian8(amount);
  const pubkeyRoot = sha256Concat(pk, new Uint8Array(16));
  const sigSlice1 = sigBytes.slice(0, 64);
  const sigSlice2 = sigBytes.slice(64);
  const sigSlice1Root = sha256Concat(sigSlice1);
  const sigSlice2Root = sha256Concat(sigSlice2, new Uint8Array(32));
  const signatureRoot = sha256Concat(sigSlice1Root, sigSlice2Root);
  const part1 = sha256Concat(pubkeyRoot, wcBytes);
  const part2 = sha256Concat(amountLE64, new Uint8Array(24), signatureRoot);
  const depositDataRoot = sha256Concat(part1, part2);
  return '0x' + Buffer.from(depositDataRoot).toString('hex');
};

describe('computeDepositDataRoot', () => {
  test('matches manual implementation', () => {
    const pubkey = '0x' + '11'.repeat(48);
    const wc = '0x' + '22'.repeat(32);
    const sig = '0x' + '33'.repeat(96);
    const amount = 32000000000n;
    const expected = manual(pubkey, wc, sig, amount);
    expect(computeDepositDataRoot(pubkey, wc, sig, amount)).toBe(expected);
  });
});
