import { CID, Version } from 'multiformats/cid';
import { MemoryBlockstore } from 'blockstore-core';
import { importer } from 'ipfs-unixfs-importer';
import jsonBigInt from 'json-bigint';
import fs from 'node:fs/promises';
import path from 'node:path';

import { logInfo, logTable } from './logging/console.js';
import { assertSafeUrl } from './data-validators.js';
import { parseEnvInt } from './env.js';

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs';

// Max IPFS content size — guards against OOM from an oversized CID.
// Override: maxBytes arg > IPFS_MAX_CONTENT_BYTES env > this default.
export const DEFAULT_IPFS_MAX_CONTENT_BYTES = 20 * 1024 * 1024;

export type BigNumberType = 'bigint' | 'string';
export type ReportFetchArgs = {
  cid: string;
  gateway?: string;
  bigNumberType?: BigNumberType;
  maxBytes?: number;
};

const IPFS_CACHE_DIR = path.resolve('ipfs-cache');

// arg > env > default
const resolveMaxBytes = (override?: number): number => {
  if (
    typeof override === 'number' &&
    Number.isFinite(override) &&
    override > 0
  ) {
    return override;
  }

  return Math.max(
    1,
    parseEnvInt(
      process.env.IPFS_MAX_CONTENT_BYTES,
      DEFAULT_IPFS_MAX_CONTENT_BYTES,
    ),
  );
};

// Cheap pre-check. Header may be absent or lie — streaming is the real limit.
const assertContentLengthWithinLimit = (
  response: Response,
  maxBytes: number,
): void => {
  const declared = Number(response.headers?.get('content-length'));

  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new Error(
      `IPFS content too large: ${declared} bytes exceeds limit of ${maxBytes} bytes`,
    );
  }
};

// Join collected byte chunks into a single buffer.
const concatChunks = (chunks: Uint8Array[], total: number): Uint8Array => {
  const out = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return out;
};

// Read in chunks, abort once total exceeds maxBytes (before full buffering).
const streamBodyWithLimit = async (
  body: ReadableStream<Uint8Array>,
  maxBytes: number,
): Promise<Uint8Array> => {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(`IPFS content exceeds size limit of ${maxBytes} bytes`);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock?.();
  }

  return concatChunks(chunks, total);
};

// Streaming is the real limit; Content-Length is just an early reject.
// Fail closed if there's no body — a real fetch always has one for content.
const readBodyWithLimit = async (
  response: Response,
  maxBytes: number,
): Promise<Uint8Array> => {
  assertContentLengthWithinLimit(response, maxBytes);

  if (!response.body) {
    throw new Error('IPFS response has no readable body');
  }

  return streamBodyWithLimit(response.body, maxBytes);
};

export const fetchIPFS = async <T>(
  args: ReportFetchArgs,
  cache = true,
): Promise<T> => {
  const { cid, gateway = IPFS_GATEWAY, maxBytes } = args;

  if (cache) return fetchIPFSWithCacheAndVerify<T>(cid, gateway, maxBytes);

  const { json } = await fetchIPFSDirectAndVerify<T>(cid, gateway, maxBytes);
  return json;
};

// Fetching content by CID through IPFS gateway
export const fetchIPFSDirect = async <T>(args: ReportFetchArgs): Promise<T> => {
  const { cid, gateway = IPFS_GATEWAY, bigNumberType = 'string' } = args;
  assertSafeUrl(gateway, 'IPFS gateway');
  const maxBytes = resolveMaxBytes(args.maxBytes);
  const ipfsUrl = `${gateway}/${cid}`;

  logInfo('Fetching content from', ipfsUrl);

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
  }

  const raw = new TextDecoder().decode(
    await readBodyWithLimit(response, maxBytes),
  );
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
  const maxBytes = resolveMaxBytes(args.maxBytes);
  const ipfsUrl = `${gateway}/${cid}`;
  logInfo('Fetching content from', ipfsUrl);

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
  }
  return readBodyWithLimit(response, maxBytes);
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
  maxBytes?: number,
): Promise<{ json: T; fileContent: Uint8Array }> => {
  let originalCID: CID;
  try {
    originalCID = CID.parse(cid);
  } catch {
    throw new Error(`Invalid IPFS CID: ${cid}`);
  }

  const fileContent = await fetchIPFSBuffer({ cid, gateway, maxBytes });
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
  maxBytes?: number,
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
    const { json } = await fetchIPFSDirectAndVerify<T>(cid, gateway, maxBytes);
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
