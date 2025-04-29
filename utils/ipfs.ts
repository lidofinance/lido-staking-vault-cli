import { CID } from 'multiformats/cid';
import { MemoryBlockstore } from 'blockstore-core';
import { importer } from 'ipfs-unixfs-importer';
import jsonBigInt from 'json-bigint';

import { logInfo, logResult } from './logging/console.js';

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs';

// Fetching content by CID through IPFS gateway
export const fetchIPFS = async (CID: string, url = IPFS_GATEWAY) => {
  const ipfsUrl = `${url}/${CID}`;

  logInfo('Fetching content from', ipfsUrl);

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
  }

  const raw = await response.text();
  const parsed = jsonBigInt({ useNativeBigInt: true }).parse(raw);

  return parsed;
};

// Fetching buffer content by CID through IPFS gateway
export const fetchIPFSBuffer = async (
  cid: string,
  gateway = IPFS_GATEWAY,
): Promise<Uint8Array> => {
  const response = await fetch(`${gateway}/${cid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.statusText}`);
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
export const fetchAndVerifyFile = async (
  cid: string,
  gateway = IPFS_GATEWAY,
): Promise<Uint8Array> => {
  const originalCID = CID.parse(cid);

  const fileContent = await fetchIPFSBuffer(cid, gateway);
  const calculatedCID = await calculateIPFSAddCID(fileContent);

  logInfo('Original CID:  ', originalCID.toString());
  logInfo('Calculated CID:', calculatedCID.toString());

  if (!calculatedCID.equals(originalCID)) {
    throw new Error(
      `❌ CID mismatch! Expected ${originalCID}, but got ${calculatedCID}`,
    );
  }

  logResult('✅ CID verified, file matches IPFS hash');
  return fileContent;
};
