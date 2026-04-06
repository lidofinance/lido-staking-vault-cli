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

import { CID } from 'multiformats/cid';
import * as ipfs from '../../utils/ipfs.js';
import type { Mock } from 'vitest';

const fakeCid = CID.parse(
  'bafkreigh2akiscaildcjk2d6gtrevhb7f7esg6k4t4u5p4sqkgfa6vlriu',
);

let logInfo: Mock;
let logTable: Mock;
let importer: Mock;

beforeEach(async () => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn() as any;

  const loggingModule = await import('../../utils/logging/console.js');
  logInfo = loggingModule.logInfo as unknown as Mock;
  logTable = loggingModule.logTable as unknown as Mock;

  const importerModule = await import('ipfs-unixfs-importer');
  importer = importerModule.importer as unknown as Mock;
});

describe('ipfs helpers', () => {
  test('fetchIPFS parses JSON response', async () => {
    const jsonData = '{"foo":1}';
    const encoder = new TextEncoder();
    const buffer = encoder.encode(jsonData).buffer;
    const testCid = fakeCid.toString();

    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => jsonData,
      arrayBuffer: async () => buffer,
    });

    // Mock importer for calculateIPFSAddCID
    importer.mockImplementationOnce(async function* () {
      yield { cid: fakeCid };
    });

    const res = await ipfs.fetchIPFS<{ foo: number }>({ cid: testCid }, false);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      `https://ipfs.io/ipfs/${testCid}`,
    );
    expect(res).toEqual({ foo: 1 });
    expect(logInfo).toHaveBeenCalled();
  });

  test('fetchIPFS throws on bad response', async () => {
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'bad',
    });
    await expect(ipfs.fetchIPFS({ cid: 'fail' }, false)).rejects.toThrow(
      'Failed to fetch IPFS content: bad',
    );
  });

  test('fetchIPFSBuffer returns buffer', async () => {
    const buf = new ArrayBuffer(4);
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => buf,
    });
    const res = await ipfs.fetchIPFSBuffer({ cid: 'abc' });
    expect(globalThis.fetch).toHaveBeenCalledWith('https://ipfs.io/ipfs/abc');
    expect(res).toEqual(new Uint8Array(buf));
  });

  test('calculateIPFSAddCID returns last CID', async () => {
    importer.mockImplementationOnce(async function* () {
      yield { cid: fakeCid };
    });
    const cid = await ipfs.calculateIPFSAddCID(new Uint8Array([1, 2]));
    expect(cid).toBe(fakeCid);
  });

  test('calculateIPFSAddCID throws with no entries', async () => {
    importer.mockImplementationOnce(async function* () {});
    await expect(ipfs.calculateIPFSAddCID(new Uint8Array())).rejects.toThrow(
      'CID calculation failed',
    );
  });

  test('fetchAndVerifyFile verifies CID', async () => {
    const jsonData = '{"test":123}';
    const encoder = new TextEncoder();
    const fileContent = encoder.encode(jsonData);

    // Mock fetch to prevent actual network calls
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => fileContent.buffer,
    });

    importer.mockImplementationOnce(async function* () {
      yield { cid: fakeCid };
    });

    const res = await ipfs.fetchIPFSDirectAndVerify(fakeCid.toString());
    expect(res.fileContent).toEqual(fileContent);
    expect(res.json).toEqual({ test: 123 });
    expect(logTable).toHaveBeenCalled();
  });

  test('fetchAndVerifyFile throws on mismatch', async () => {
    const other = CID.parse(
      'bafkreib3m4q5x2fr2di5m3lgvq4hzj4qkgjq2d0k8vh7y6xfxkrmwrkduy',
    );
    const dataCid = `bafkreigh2akiscaildcjk2d6gtrevhb7f7esg6k4t4u5p4sqkgfa6vlriu`;
    const jsonData = '{"test":456}';
    const encoder = new TextEncoder();
    const fileContent = encoder.encode(jsonData);

    // Mock fetch to return the file content
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => fileContent.buffer,
    });

    // Mock importer to return different CID
    importer.mockImplementationOnce(async function* () {
      yield { cid: other };
    });

    await expect(
      ipfs.fetchIPFSDirectAndVerify(fakeCid.toString()),
    ).rejects.toThrow(
      `❌ File hash mismatch! Expected ${dataCid}, but got ${other}`,
    );
  });
});
