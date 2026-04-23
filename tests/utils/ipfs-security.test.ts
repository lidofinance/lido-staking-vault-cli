import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('multiformats/cid', () => {
  class MockCID {
    str: string;
    constructor(str: string) {
      this.str = str;
    }
    toString() {
      return this.str;
    }
    equals(other: any) {
      return other && other.str === this.str;
    }
    static parse(str: string) {
      if (str === 'INVALID_CID' || str.includes('..'))
        throw new Error('Invalid CID');
      return new MockCID(str);
    }
  }
  return { CID: MockCID };
});

vi.mock('blockstore-core', () => ({ MemoryBlockstore: vi.fn() }));
vi.mock('ipfs-unixfs-importer', () => ({ importer: vi.fn() }));
vi.mock('../../utils/logging/console.js', () => ({
  logInfo: vi.fn(),
  logTable: vi.fn(),
}));

import * as ipfs from '../../utils/ipfs.js';
import type { Mock } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn() as any;
});

describe('IPFS SSRF guards (H2/H3)', () => {
  test('fetchIPFSDirect rejects non-http/https gateway', async () => {
    await expect(
      ipfs.fetchIPFSDirect({ cid: 'abc', gateway: 'file:///etc/passwd' }),
    ).rejects.toThrow('unsupported URL scheme "file:"');
  });

  test('fetchIPFSDirect rejects ftp gateway', async () => {
    await expect(
      ipfs.fetchIPFSDirect({ cid: 'abc', gateway: 'ftp://evil.com' }),
    ).rejects.toThrow('unsupported URL scheme "ftp:"');
  });

  test('fetchIPFSDirect rejects invalid gateway URL', async () => {
    await expect(
      ipfs.fetchIPFSDirect({ cid: 'abc', gateway: 'not-a-url' }),
    ).rejects.toThrow('invalid URL');
  });

  test('fetchIPFSBuffer rejects non-http/https gateway', async () => {
    await expect(
      ipfs.fetchIPFSBuffer({ cid: 'abc', gateway: 'file:///etc/passwd' }),
    ).rejects.toThrow('unsupported URL scheme "file:"');
  });

  test('fetchIPFSDirect allows https gateway', async () => {
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '{"x":1}',
    });
    const result = await ipfs.fetchIPFSDirect({
      cid: 'abc',
      gateway: 'https://ipfs.io/ipfs',
    });
    expect(result).toEqual({ x: 1 });
  });

  test('fetchIPFSDirect allows http gateway', async () => {
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => '{"y":2}',
    });
    const result = await ipfs.fetchIPFSDirect({
      cid: 'abc',
      gateway: 'http://localhost:5001/ipfs',
    });
    expect(result).toEqual({ y: 2 });
  });

  test('pinToIPFS rejects non-http/https upload URL', async () => {
    await expect(
      ipfs.pinToIPFS({
        uploadUrl: 'file:///tmp/upload',
        fileContent: '{}',
      }),
    ).rejects.toThrow('unsupported URL scheme "file:"');
  });

  test('pinToIPFS rejects invalid upload URL', async () => {
    await expect(
      ipfs.pinToIPFS({
        uploadUrl: 'not-a-url',
        fileContent: '{}',
      }),
    ).rejects.toThrow('invalid URL');
  });

  test('pinToIPFS allows https upload URL', async () => {
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ IpfsHash: 'Qm123' }),
    });
    const result = await ipfs.pinToIPFS({
      uploadUrl: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      fileContent: '{}',
    });
    expect(result).toEqual({ IpfsHash: 'Qm123' });
  });
});

describe('IPFS CID validation (M6)', () => {
  test('fetchIPFSDirectAndVerify rejects invalid CID', async () => {
    await expect(
      ipfs.fetchIPFSDirectAndVerify('INVALID_CID'),
    ).rejects.toThrow('Invalid IPFS CID: INVALID_CID');
  });

  test('fetchIPFSWithCacheAndVerify rejects path-traversal CID before fs access', async () => {
    await expect(
      ipfs.fetchIPFSWithCacheAndVerify('../../../etc/passwd'),
    ).rejects.toThrow('Invalid IPFS CID');
  });

  test('fetchIPFSWithCacheAndVerify validates gateway URL', async () => {
    await expect(
      ipfs.fetchIPFSWithCacheAndVerify('validcid', 'file:///etc/passwd'),
    ).rejects.toThrow('unsupported URL scheme "file:"');
  });
});
