import {
  fromHex,
  sha256Concat,
  encodeGweiAsLittleEndian8,
} from './proof/index.js';

/**
 * - pubkey:  bytes
 * - withdrawalCredentials: bytes
 * - signature: bytes
 * - amountWei: bigint или string (в wei)
 */
export const computeDepositDataRoot = (
  pubkey: string,
  withdrawalCredentials: string,
  signature: string,
  amountWei: bigint | string,
): string => {
  const pubkeyBytes = fromHex(pubkey);
  const withdrawalCredentialsBytes = fromHex(withdrawalCredentials);
  const signatureBytes = fromHex(signature);
  // 1) Convert amount from wei to gwei
  const amountWeiBN =
    typeof amountWei !== 'bigint' ? BigInt(amountWei) : amountWei;
  const amountGwei = amountWeiBN / 1_000_000_000n;

  // 2) Get 8 bytes little-endian
  const amountLE64 = encodeGweiAsLittleEndian8(amountGwei);

  // 3) pubkeyRoot = sha256(pubkey + 16 zero bytes)
  const pubkeyRoot = sha256Concat(
    pubkeyBytes,
    new Uint8Array(16), // 16 zero bytes
  );

  // 4) signatureRoot
  //    - sigSlice1Root = sha256(signature[0..64])
  //    - sigSlice2Root = sha256(signature[64..end] + 32 zero bytes)
  //    - signatureRoot = sha256(sigSlice1Root + sigSlice2Root)
  const sigSlice1 = signatureBytes.slice(0, 64); // first 64 bytes
  const sigSlice2 = signatureBytes.slice(64); // remaining (usually 32 bytes)
  const sigSlice1Root = sha256Concat(sigSlice1);
  const sigSlice2Root = sha256Concat(
    sigSlice2,
    new Uint8Array(32), // 32 zero bytes
  );
  const signatureRoot = sha256Concat(sigSlice1Root, sigSlice2Root);

  // 5) Sum all, as in Solidity:
  //    depositDataRoot = sha256(
  //       sha256(pubkeyRoot, withdrawalCredentials),
  //       sha256(amountLE64, 24 нулевых байт, signatureRoot)
  //    )
  const part1 = sha256Concat(pubkeyRoot, withdrawalCredentialsBytes);
  const part2 = sha256Concat(
    amountLE64,
    new Uint8Array(24), // 24 нулевых
    signatureRoot,
  );
  const depositDataRoot = sha256Concat(part1, part2);

  // Return in hex-string format '0x...'
  return '0x' + Buffer.from(depositDataRoot).toString('hex');
};
