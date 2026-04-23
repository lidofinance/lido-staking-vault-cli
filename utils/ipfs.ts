import { CID, Version } from 'multiformats/cid';
import { MemoryBlockstore } from 'blockstore-core';
import { importer } from 'ipfs-unixfs-importer';
import jsonBigInt from 'json-bigint';
import fs from 'node:fs/promises';
import path from 'node:path';

import { logInfo, logTable } from './logging/console.js';
import { ALLOWED_HTTP_SCHEMES } from './data-validators.js';

const assertSafeUrl = (url: string, label: string): void => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label}: invalid URL: ${url}`);
  }
  if (!ALLOWED_HTTP_SCHEMES.has(parsed.protocol)) {
    throw new Error(
      `${label}: unsupported URL scheme "${parsed.protocol}" (only http/https allowed)`,
    );
  }
};

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
  assertSafeUrl(gateway, 'IPFS gateway');
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
  assertSafeUrl(gateway, 'IPFS gateway');
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
  version: Version = 0,
): Promise<CID> => {
  const blockstore = new MemoryBlockstore();

  const entries = importer([{ content: fileContent }], blockstore, {
    cidVersion: version,
    // important! otherwise CID will be v1
    rawLeaves: version === 0 ? false : undefined,
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
  let originalCID: CID;
  try {
    originalCID = CID.parse(cid);
  } catch {
    throw new Error(`Invalid IPFS CID: ${cid}`);
  }

  const fileContent = await fetchIPFSBuffer({ cid, gateway });
  const calculatedCID = await calculateIPFSAddCID(
    fileContent,
    originalCID.version,
  );

  if (!calculatedCID.equals(originalCID)) {
    throw new Error(
      `❌ File hash mismatch! Expected ${originalCID}, but got ${calculatedCID}`,
    );
  }

  logTable({
    data: [
      ['✅ CID verified, file matches IPFS hash'],
      [`Original CIDv${originalCID.version}`, originalCID.toString()],
      [`Calculated CIDv${calculatedCID.version}`, calculatedCID.toString()],
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
  assertSafeUrl(gateway, 'IPFS gateway');
  try {
    CID.parse(cid);
  } catch {
    throw new Error(`Invalid IPFS CID: ${cid}`);
  }

  await fs.mkdir(IPFS_CACHE_DIR, { recursive: true });
  const cacheFile = path.join(IPFS_CACHE_DIR, `${cid}.json`);

  try {
    logInfo('Trying to get content from cache', cid);
    const data = await fs.readFile(cacheFile, 'utf8');
    return JSON.parse(data) as T;
  } catch {
    // Not in cache, fetch from IPFS
    const { json } = await fetchIPFSDirectAndVerify<T>(cid, gateway);
    await fs.writeFile(cacheFile, JSON.stringify(json), 'utf8');
    return json;
  }
};

type PinToIPFSArgs = {
  uploadUrl: string;
  uploadAuthorization?: string;
  fileContent: string;
  fileName?: string;
  uploadType?: 'pinata';
};

export const pinToIPFS = async ({
  fileContent,
  fileName = 'file.json',
  uploadAuthorization,
  uploadUrl,
}: PinToIPFSArgs): Promise<any> => {
  assertSafeUrl(uploadUrl, 'IPFS upload URL');
  const blob = new Blob([fileContent]);
  const file = new File([blob], fileName, {
    type: 'application/json',
  });
  const formData = new FormData();
  formData.append('file', file);

  const fetchResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      ...(uploadAuthorization
        ? { Authorization: `Bearer ${uploadAuthorization}` }
        : {}),
    },

    body: formData,
  });

  if (!fetchResponse.ok) {
    throw new Error(
      `Failed to upload distribution data to pinning service at ${uploadUrl}. Status: ${fetchResponse.status} ${fetchResponse.statusText}`,
    );
  }
  const responseData = await fetchResponse.json();
  return responseData;
};
