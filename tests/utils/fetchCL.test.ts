import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  fetchBeaconHeader,
  fetchBeaconState,
  fetchBeaconHeaderByParentRoot,
} from '../../utils/fetchCL.js';
import { printError } from 'utils';

jest.mock('configs', () => ({
  getConfig: jest.fn(() => ({ CL_URL: 'https://cl.example/' })),
}));
jest.mock('utils', () => ({ printError: jest.fn() }));
jest.mock('@lodestar/types', () => ({}), { virtual: true });

const mockFetch: any = jest.fn();

beforeEach(() => {
  (global as any).fetch = mockFetch;
  jest.clearAllMocks();
});

describe('fetchCL helpers', () => {
  test('fetchBeaconHeader returns parsed JSON', async () => {
    mockFetch.mockImplementationOnce(
      async () =>
        ({
          json: async () => ({ data: 1 }),
        }) as Response,
    );
    const res = await fetchBeaconHeader('head');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://cl.example/eth/v1/beacon/headers/head',
    );
    expect(res).toEqual({ data: 1 });
  });

  test('fetchBeaconState returns state and fork name', async () => {
    const buffer = new ArrayBuffer(8);
    mockFetch.mockImplementationOnce(
      async () =>
        ({
          headers: { get: () => 'capella' } as any,
          arrayBuffer: async () => buffer,
        }) as Response,
    );
    const res = await fetchBeaconState('head');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://cl.example/eth/v2/debug/beacon/states/head',
      {
        headers: { accept: 'application/octet-stream' },
      },
    );
    expect(res).toEqual({ stateBodyBytes: buffer, forkName: 'capella' });
  });

  test('fetchBeaconState rejects for unsupported fork', async () => {
    mockFetch.mockImplementationOnce(
      async () =>
        ({
          headers: { get: () => 'unknown' } as any,
          arrayBuffer: async () => new ArrayBuffer(0),
        }) as Response,
    );
    await expect(fetchBeaconState('head')).rejects.toThrow(
      'Fork name [unknown] is not supported',
    );
  });

  test('fetchBeaconHeaderByParentRoot returns parsed JSON', async () => {
    mockFetch.mockImplementationOnce(
      async () =>
        ({
          json: async () => ({ data: 2 }),
        }) as Response,
    );
    const res = await fetchBeaconHeaderByParentRoot('0xabc');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://cl.example/eth/v1/beacon/headers?parent_root=0xabc',
    );
    expect(res).toEqual({ data: 2 });
  });

  test('fetchBeaconHeader prints error on failure', async () => {
    const error = new Error('fail');
    mockFetch.mockRejectedValueOnce(error);
    await expect(fetchBeaconHeader('head')).rejects.toThrow('fail');
    expect(printError).toHaveBeenCalledWith(
      error,
      'Error fetching beacon header',
    );
  });
});
