import { CID } from 'multiformats/cid';
import { MemoryBlockstore } from 'blockstore-core';
import { importer } from 'ipfs-unixfs-importer';
import jsonBigInt from 'json-bigint';
import fs from 'fs/promises';
import path from 'path';

import { logInfo, logTable } from './logging/console.js';

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs';

export type BigNumberType = 'bigint' | 'string';
export type ReportFetchArgs = {
  cid: string;
  gateway?: string;
  bigNumberType?: BigNumberType;
};

const IPFS_CACHE_DIR = path.resolve('ipfs-cache');

export const fetchIPFS = async <T>(
  args: ReportFetchArgs,
  cache = true,
): Promise<T> => {
  const { cid, gateway = IPFS_GATEWAY } = args;

  if (cache) return fetchIPFSWithCacheAndVerify<T>(cid, gateway);

  const { json } = await fetchIPFSDirectAndVerify<T>(cid, gateway);
  return json;
};

// Fetching content by CID through IPFS gateway
export const fetchIPFSDirect = async <T>(args: ReportFetchArgs): Promise<T> => {
  const { cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  const ipfsUrl = `${gateway}/${cid}`;

  logInfo('Fetching content from', ipfsUrl);

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
  }

  const raw = await response.text();
  const params =
    bigNumberType === 'bigint'
      ? { useNativeBigInt: true }
      : { storeAsString: true };
  const parsed = jsonBigInt(params).parse(raw);

  return parsed;
};

// Fetching buffer content by CID through IPFS gateway
export const fetchIPFSBuffer = async (
  args: ReportFetchArgs,
): Promise<Uint8Array> => {
  const { cid, gateway = IPFS_GATEWAY } = args;
  const ipfsUrl = `${gateway}/${cid}`;
  logInfo('Fetching content from', ipfsUrl);

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

// Recalculate CID using full UnixFS logic (like `ipfs add`)
export const calculateIPFSAddCID = async (
  fileContent: Uint8Array,
): Promise<CID> => {
  const blockstore = new MemoryBlockstore();

  const entries = importer([{ content: fileContent }], blockstore, {
    cidVersion: 0,
    rawLeaves: false, // important! otherwise CID will be v1
  });

  let lastCid: CID | null = null;
  for await (const entry of entries) {
    lastCid = entry.cid;
  }

  if (!lastCid) {
    throw new Error('CID calculation failed — no entries found');
  }

  return lastCid;
};

// Downloading file from IPFS and checking its integrity
export const fetchIPFSDirectAndVerify = async <T>(
  cid: string,
  gateway = IPFS_GATEWAY,
): Promise<{ json: T; fileContent: Uint8Array }> => {
  const originalCID = CID.parse(cid);

  const fileContent = await fetchIPFSBuffer({ cid, gateway });
  const calculatedCID = await calculateIPFSAddCID(fileContent);

  if (!calculatedCID.equals(originalCID)) {
    throw new Error(
      `❌ CID mismatch! Expected ${originalCID}, but got ${calculatedCID}`,
    );
  }

  logTable({
    data: [
      ['✅ CID verified, file matches IPFS hash'],
      ['Original CID', originalCID.toString()],
      ['Calculated CID', calculatedCID.toString()],
    ],
    params: {
      head: ['Type', 'CID'],
    },
  });
  const json = JSON.parse(new TextDecoder().decode(fileContent)) as T;
  return {
    fileContent,
    json,
  };
};

export const fetchIPFSWithCacheAndVerify = async <T>(
  cid: string,
  gateway = IPFS_GATEWAY,
): Promise<T> => {
  await fs.mkdir(IPFS_CACHE_DIR, { recursive: true });
  const cacheFile = path.join(IPFS_CACHE_DIR, `${cid}.json`);

  try {
    logInfo('Trying to get content from cache', cid);
    const data = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    // Not in cache, fetch from IPFS
    const { json } = await fetchIPFSDirectAndVerify<T>(cid, gateway);
    await fs.writeFile(cacheFile, JSON.stringify(json), 'utf-8');
    return json;
  }
};
