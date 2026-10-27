import { describe, test, expect } from 'vitest';

import { calculateIPFSAddCID } from '../../utils/ipfs.js';

// Unmocked importer: expected CIDs come from `ipfs add --only-hash` (kubo 0.42).
// Guards CID verification against regressions in the IPFS dependency stack.

const small = new TextEncoder().encode('hello world\n');

// 300 KiB spans two 256 KiB chunks, so the root is a DAG node.
const big = Uint8Array.from({ length: 300 * 1024 }, (_, i) => i % 251);

describe('calculateIPFSAddCID matches ipfs add', () => {
  test.each([
    [
      'single chunk, v0',
      small,
      0,
      'QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o',
    ],
    [
      'single chunk, v1',
      small,
      1,
      'bafkreifjjcie6lypi6ny7amxnfftagclbuxndqonfipmb64f2km2devei4',
    ],
    [
      'multi chunk, v0',
      big,
      0,
      'QmTMdR3F3Dkc5fwGhVTHiruQUTbnVia6a8bFcdtK7Yh4hr',
    ],
    [
      'multi chunk, v1',
      big,
      1,
      'bafybeicqqpsudfblbjer72m5vzragvjxnpa7tv65nbz72epjrcxqm3jcs4',
    ],
  ] as const)('%s', async (_, content, version, expected) => {
    const cid = await calculateIPFSAddCID(content, version);
    expect(cid.toString()).toBe(expected);
  });
});
