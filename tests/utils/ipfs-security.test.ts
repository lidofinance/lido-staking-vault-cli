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
// Force a cache miss so the cached path falls through to a real fetch,
// and keep the test from touching the disk.
vi.mock('node:fs/promises', () => ({
  default: {
    mkdir: vi.fn(async () => {}),
    readFile: vi.fn(async () => {
      throw new Error('ENOENT');
    }),
    writeFile: vi.fn(async () => {}),
  },
}));

import * as ipfs from '../../utils/ipfs.js';
import type { Mock } from 'vitest';
import { streamOf } from './stream-helpers.js';

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
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
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
      body: streamOf(new TextEncoder().encode('{"x":1}')),
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
      body: streamOf(new TextEncoder().encode('{"y":2}')),
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

describe('IPFS content size limit', () => {
  const headersOf = (h: Record<string, string>) => ({
    get: (k: string) => h[k.toLowerCase()] ?? null,
  });

  // Stub the next fetch() with an ok response carrying the given body and,
  // optionally, a Content-Length header.
  const mockFetchOnce = (body: unknown, contentLength?: number) => {
    const headers: Record<string, string> =
      contentLength === undefined
        ? {}
        : { 'content-length': String(contentLength) };

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      headers: headersOf(headers),
      body,
    });
  };

  // Run fn with IPFS_MAX_CONTENT_BYTES set, always restoring the prior value.
  const withEnvLimit = async (value: number, fn: () => Promise<void>) => {
    const prev = process.env.IPFS_MAX_CONTENT_BYTES;
    process.env.IPFS_MAX_CONTENT_BYTES = String(value);

    try {
      await fn();
    } finally {
      if (prev === undefined) delete process.env.IPFS_MAX_CONTENT_BYTES;
      else process.env.IPFS_MAX_CONTENT_BYTES = prev;
    }
  };

  test('rejects on Content-Length over limit without reading body', async () => {
    const getReader = vi.fn(() => {
      throw new Error(
        'body must not be read when Content-Length exceeds limit',
      );
    });
    mockFetchOnce({ getReader }, 2_785_017_856);

    await expect(
      ipfs.fetchIPFSBuffer({ cid: 'abc', maxBytes: 20 * 1024 * 1024 }),
    ).rejects.toThrow(/too large|exceeds/i);
    expect(getReader).not.toHaveBeenCalled();
  });

  test('aborts streaming when body exceeds limit (no Content-Length)', async () => {
    mockFetchOnce(streamOf(new Uint8Array(300 * 1024).fill(7)));

    await expect(
      ipfs.fetchIPFSBuffer({ cid: 'abc', maxBytes: 128 * 1024 }),
    ).rejects.toThrow(/exceeds/i);
  });

  test('returns content within the limit', async () => {
    const payload = new Uint8Array([1, 2, 3, 4, 5]);
    mockFetchOnce(streamOf(payload), payload.byteLength);

    const res = await ipfs.fetchIPFSBuffer({
      cid: 'abc',
      maxBytes: 20 * 1024 * 1024,
    });
    expect(res).toEqual(payload);
  });

  test('fails closed when the response has no body', async () => {
    mockFetchOnce(null);

    await expect(ipfs.fetchIPFSBuffer({ cid: 'abc' })).rejects.toThrow(
      /no readable body/i,
    );
  });

  test('fetchIPFSDirect aborts streaming when body exceeds limit', async () => {
    mockFetchOnce(streamOf(new TextEncoder().encode('x'.repeat(300 * 1024))));

    await expect(
      ipfs.fetchIPFSDirect({ cid: 'abc', maxBytes: 128 * 1024 }),
    ).rejects.toThrow(/exceeds/i);
  });

  test('enforces the 20MB default when no override / env is set', async () => {
    mockFetchOnce({ getReader: vi.fn() }, 20 * 1024 * 1024 + 1);

    await expect(ipfs.fetchIPFSBuffer({ cid: 'abc' })).rejects.toThrow(
      `limit of ${20 * 1024 * 1024} bytes`,
    );
  });

  test('IPFS_MAX_CONTENT_BYTES env overrides the default', async () => {
    await withEnvLimit(64 * 1024, async () => {
      mockFetchOnce({ getReader: vi.fn() }, 128 * 1024);

      await expect(ipfs.fetchIPFSBuffer({ cid: 'abc' })).rejects.toThrow(
        `limit of ${64 * 1024} bytes`,
      );
    });
  });

  test('explicit maxBytes arg takes priority over env', async () => {
    await withEnvLimit(1024 * 1024 * 1024, async () => {
      mockFetchOnce({ getReader: vi.fn() }, 256 * 1024);

      await expect(
        ipfs.fetchIPFSBuffer({ cid: 'abc', maxBytes: 128 * 1024 }),
      ).rejects.toThrow(`limit of ${128 * 1024} bytes`);
    });
  });

  test('streaming enforces limit even when Content-Length lies', async () => {
    // header claims 1 KiB, body is actually 300 KiB
    mockFetchOnce(streamOf(new Uint8Array(300 * 1024).fill(9)), 1024);

    await expect(
      ipfs.fetchIPFSBuffer({ cid: 'abc', maxBytes: 128 * 1024 }),
    ).rejects.toThrow(`exceeds size limit of ${128 * 1024} bytes`);
  });

  test('accepts content exactly at the limit, rejects one byte over', async () => {
    const limit = 200 * 1024;

    mockFetchOnce(streamOf(new Uint8Array(limit).fill(1)));
    const ok = await ipfs.fetchIPFSBuffer({ cid: 'abc', maxBytes: limit });
    expect(ok.byteLength).toBe(limit);

    mockFetchOnce(streamOf(new Uint8Array(limit + 1).fill(1)));
    await expect(
      ipfs.fetchIPFSBuffer({ cid: 'abc', maxBytes: limit }),
    ).rejects.toThrow(`exceeds size limit of ${limit} bytes`);
  });

  test('reassembles a multi-chunk stream in order under the limit', async () => {
    const chunkSize = 64 * 1024;
    const parts = [0, 1, 2, 3, 4].map((i) =>
      new Uint8Array(chunkSize).fill(i + 1),
    );
    const payload = new Uint8Array(chunkSize * parts.length);
    for (const [i, p] of parts.entries()) {
      payload.set(p, i * chunkSize);
    }

    mockFetchOnce(streamOf(payload, chunkSize)); // one read() per chunk

    const res = await ipfs.fetchIPFSBuffer({
      cid: 'abc',
      maxBytes: 20 * 1024 * 1024,
    });
    expect(res).toEqual(payload); // order + bytes preserved across chunks
  });

  // Threading: maxBytes must survive every hop of the public API, not just
  // the leaf fetchIPFSBuffer. A dropped arg at any wrapper = silent bypass.
  test('fetchIPFS (default cached path) threads maxBytes end-to-end', async () => {
    mockFetchOnce(streamOf(new Uint8Array(300 * 1024).fill(3)));

    // cache default true -> WithCacheAndVerify -> DirectAndVerify -> Buffer
    await expect(
      ipfs.fetchIPFS({ cid: 'abc', maxBytes: 128 * 1024 }),
    ).rejects.toThrow(`exceeds size limit of ${128 * 1024} bytes`);
  });

  test('fetchIPFS (no-cache path) threads maxBytes end-to-end', async () => {
    mockFetchOnce(streamOf(new Uint8Array(300 * 1024).fill(4)));

    // cache false -> DirectAndVerify -> Buffer
    await expect(
      ipfs.fetchIPFS({ cid: 'abc', maxBytes: 128 * 1024 }, false),
    ).rejects.toThrow(`exceeds size limit of ${128 * 1024} bytes`);
  });
});

describe('IPFS CID validation (M6)', () => {
  test('fetchIPFSDirectAndVerify rejects invalid CID', async () => {
    await expect(ipfs.fetchIPFSDirectAndVerify('INVALID_CID')).rejects.toThrow(
      'Invalid IPFS CID: INVALID_CID',
    );
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
