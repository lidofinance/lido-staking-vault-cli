import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock(
  'multiformats/cid',
  () => {
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
  },
  { virtual: true },
);
import { CID } from 'multiformats/cid';
import * as ipfs from '../../utils/ipfs.js';

jest.mock('blockstore-core', () => ({ MemoryBlockstore: jest.fn() }), {
  virtual: true,
});
jest.mock('ipfs-unixfs-importer', () => ({ importer: jest.fn() }), {
  virtual: true,
});
jest.mock('../../utils/logging/console.js', () => ({
  logInfo: jest.fn(),
  logTable: jest.fn(),
}));

const logInfo = require('../../utils/logging/console.js').logInfo as jest.Mock;
const logTable = require('../../utils/logging/console.js')
  .logTable as jest.Mock;
const importer = require('ipfs-unixfs-importer').importer as jest.Mock;

const fakeCid = CID.parse(
  'bafkreigh2akiscaildcjk2d6gtrevhb7f7esg6k4t4u5p4sqkgfa6vlriu',
);

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).fetch = jest.fn();
});

describe('ipfs helpers', () => {
  test('fetchIPFS parses JSON response', async () => {
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => '{"foo":1}',
    });
    const res = await ipfs.fetchIPFS<{ foo: number }>({ cid: '123' }, false);
    expect(global.fetch).toHaveBeenCalledWith('https://ipfs.io/ipfs/123');
    expect(res).toEqual({ foo: 1 });
    expect(logInfo).toHaveBeenCalled();
  });

  test('fetchIPFS throws on bad response', async () => {
    (global as any).fetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'bad',
    });
    await expect(ipfs.fetchIPFS({ cid: 'fail' }, false)).rejects.toThrow(
      'Failed to fetch IPFS content: bad',
    );
  });

  test('fetchIPFSBuffer returns buffer', async () => {
    const buf = new ArrayBuffer(4);
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => buf,
    });
    const res = await ipfs.fetchIPFSBuffer('abc');
    expect(global.fetch).toHaveBeenCalledWith('https://ipfs.io/ipfs/abc');
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
    jest
      .spyOn(ipfs, 'fetchIPFSBuffer')
      .mockResolvedValueOnce(new Uint8Array([1]));
    jest.spyOn(ipfs, 'calculateIPFSAddCID').mockResolvedValueOnce(fakeCid);
    const res = await ipfs.fetchAndVerifyFile(fakeCid.toString());
    expect(res).toEqual(new Uint8Array([1]));
    expect(logTable).toHaveBeenCalled();
  });

  test('fetchAndVerifyFile throws on mismatch', async () => {
    const other = CID.parse(
      'bafkreib3m4q5x2fr2di5m3lgvq4hzj4qkgjq2d0k8vh7y6xfxkrmwrkduy',
    );
    jest
      .spyOn(ipfs, 'fetchIPFSBuffer')
      .mockResolvedValueOnce(new Uint8Array([1]));
    jest.spyOn(ipfs, 'calculateIPFSAddCID').mockResolvedValueOnce(other);
    await expect(ipfs.fetchAndVerifyFile(fakeCid.toString())).rejects.toThrow(
      'CID mismatch',
    );
  });
});
