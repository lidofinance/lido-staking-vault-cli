/* 
  Utils that could be used for testing lodestar packages
*/
import { createHash } from 'crypto';

type Validator = {
  pubkey: Uint8Array<ArrayBufferLike>;
  withdrawalCredentials: Uint8Array<ArrayBufferLike>;
  effectiveBalance: number;
  slashed: boolean;
  activationEligibilityEpoch: number;
  activationEpoch: number;
  exitEpoch: number | typeof Infinity;
  withdrawableEpoch: number | typeof Infinity;
};

type BeaconBlockHeader = {
  slot: number;
  proposer_index: number;
  parent_root: string;
  state_root: string;
  body_root: string;
};
/** Hex -> bytes */
export const fromHex = (hex: string): Uint8Array => {
  if (hex.startsWith('0x')) hex = hex.slice(2);
  return new Uint8Array(Buffer.from(hex, 'hex'));
};

/** Bytes -> hex */
export const toHex = (value: unknown) => {
  if (typeof value === 'string' && !value.startsWith('0x')) {
    return `0x${value}`;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return `0x${value.toString(16)}`;
  }

  if (value instanceof Uint8Array) {
    return `0x${Buffer.from(value).toString('hex')}`;
  }

  throw new Error('Unsupported value type');
};

/** sha256(32+32) => 32 */
export const sha256Pair = (left: Uint8Array, right: Uint8Array): Uint8Array => {
  if (left.length !== 32 || right.length !== 32) {
    throw new Error('sha256Pair expects 2 x 32-byte inputs');
  }
  const buf = Buffer.alloc(64);
  buf.set(left, 0);
  buf.set(right, 32);
  return createHash('sha256').update(buf).digest();
};

/**
 * Helper for SHA-256 over multiple Uint8Array chunks.
 * Returns a 32-byte hash (Uint8Array of length 32).
 */
export const sha256Concat = (...chunks: Uint8Array[]): Uint8Array => {
  const hash = createHash('sha256');
  for (const chunk of chunks) {
    hash.update(chunk);
  }
  return hash.digest();
};

/** 48 => 64 padded => sha256 => 32 */
export const pubkeyRoot = (pubkey48: Uint8Array): Uint8Array => {
  if (pubkey48.length !== 48) {
    throw new Error(`pubkey must be 48 bytes, got=${pubkey48.length}`);
  }
  const padded = Buffer.alloc(64);
  padded.set(pubkey48, 0);
  return createHash('sha256').update(padded).digest();
};

/** uint64 => little-endian => pad => 32 */
export const uint64To32LE = (val: bigint): Uint8Array => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(val, 0);
  return Buffer.concat([b, Buffer.alloc(24)]);
};

/**
 * Converts BigInt (gwei) to 8 bytes (big-endian), then reverses it to little-endian.
 * Returns Uint8Array[8].
 */
export const encodeGweiAsLittleEndian8 = (amountGwei: bigint): Uint8Array => {
  // First 8 bytes big-endian
  const be = new Uint8Array(8);
  let tmp = amountGwei;
  for (let i = 7; i >= 0; i--) {
    be[i] = Number(tmp & 0xffn);
    tmp >>= 8n;
  }

  // Now reverse it (big-endian -> little-endian)
  const le = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    le[i] = be[7 - i] ?? 0;
  }
  return le;
};

/** bool => 1 byte => 32 */
export const boolTo32 = (b: boolean): Uint8Array => {
  const oneByte = Buffer.from([b ? 1 : 0]);
  return Buffer.concat([oneByte, Buffer.alloc(31)]);
};

/**
 * If value == Infinity, treat it as 2^64-1 (18446744073709551615)
 * sentinel "Infinity" => max uint64
 */
export const safeUint64 = (value: number): bigint => {
  if (!Number.isFinite(value)) {
    // sentinel "Infinity" => max uint64
    return 18446744073709551615n;
  }
  return BigInt(value);
};

export const manualSubProofPubkeyWC = (validator: Validator) => {
  const pubkey48 = new Uint8Array(validator.pubkey); // 48
  const wc32 = new Uint8Array(validator.withdrawalCredentials); // 32

  const effBalance32 = uint64To32LE(BigInt(validator.effectiveBalance));
  const slashed32 = boolTo32(!!validator.slashed);
  const actElig32 = uint64To32LE(BigInt(validator.activationEligibilityEpoch));
  const act32 = uint64To32LE(BigInt(validator.activationEpoch));
  const exitEpochSafe = safeUint64(validator.exitEpoch);
  const exit32 = uint64To32LE(exitEpochSafe);
  const withdrawableEpochSafe = safeUint64(validator.withdrawableEpoch);
  const wdble32 = uint64To32LE(withdrawableEpochSafe);

  const node0 = sha256Pair(pubkeyRoot(pubkey48), wc32);
  const node1 = sha256Pair(effBalance32, slashed32);
  const node2 = sha256Pair(actElig32, act32);
  const node3 = sha256Pair(exit32, wdble32);
  const node01 = sha256Pair(node0, node1);
  const node23 = sha256Pair(node2, node3);

  const siblings = [node1, node23];
  const root = sha256Pair(node01, node23);

  return {
    leafPubkeyWC: node0,
    root,
    siblings,
  };
};

export const manualSubProofBeaconBlockHeader = (
  blockHeader: BeaconBlockHeader,
) => {
  const slot = blockHeader.slot;
  const proposerIndex = blockHeader.proposer_index;
  const parentRoot = blockHeader.parent_root;
  const stateRoot = blockHeader.state_root;
  const bodyRoot = blockHeader.body_root;
  const zero1_32 = new Uint8Array(32);
  const zero2_32 = new Uint8Array(32);
  const zero3_32 = new Uint8Array(32);

  const slot32 = uint64To32LE(BigInt(slot));
  const proposerIndex32 = uint64To32LE(BigInt(proposerIndex));
  const parentRoot32 = fromHex(parentRoot);
  const stateRoot32 = fromHex(stateRoot);
  const bodyRoot32 = fromHex(bodyRoot);

  const node0 = sha256Pair(slot32, proposerIndex32);
  const node1 = sha256Pair(parentRoot32, stateRoot32);
  const node2 = sha256Pair(bodyRoot32, zero1_32);
  const node3 = sha256Pair(zero2_32, zero3_32);

  const node01 = sha256Pair(node0, node1);
  const node23 = sha256Pair(node2, node3);

  const siblings = [parentRoot32, node0, node23];
  const root = sha256Pair(node01, node23);

  return {
    root,
    siblings,
  };
};

/*                                 
                                    gIndex=1
                          Validator Container Root
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │ 
                     gIndex=2                         gIndex=3
                      node                            proof[1]             **DEPTH = 1
                        │                               │
                ┌───────┴───────┐               ┌───────┴───────┐
                │               │               │               │
            gIndex=4       gIndex=5         gIndex=6          gIndex=7
        Proven Parent      proof[0]           node             node        **DEPTH = 2
                │               │               │               │
          ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
          │           │   │           │   │           │   │           │
      [pubkeyRoot]  [wc]  [EB] [slashed] [AEE]      [AE] [EE]       [WE]   **DEPTH = 3
*/
export const getPubkeyWCParentGIndex = (): bigint => {
  const depth = 2;
  const position = 0;
  return BigInt((1 << depth) + position); // => 4
};
