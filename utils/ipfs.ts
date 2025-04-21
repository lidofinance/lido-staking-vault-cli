import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';

import { logInfo } from './logging/console.js';

// TODO: change to the general IPFS gateway
export const IPFS_GATEWAY =
  'https://emerald-characteristic-yak-701.mypinata.cloud/ipfs';

export const fetchIPFS = async (CID: string, url = IPFS_GATEWAY) => {
  const ipfsUrl = `${url}/${CID}`;

  logInfo('Fetching content from', ipfsUrl);

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
  }

  return response.json();
};

// Fetching content by CID through IPFS gateway
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

// Recalculating CID based on downloaded content
export const calculateCID = async (content: Uint8Array) => {
  const hashDigest = await sha256.digest(content);
  return CID.createV1(0x55, hashDigest);
};

// Downloading file from IPFS and checking its integrity
export const fetchAndVerifyFile = async (
  cidStr: string,
  gateway = IPFS_GATEWAY,
): Promise<Uint8Array> => {
  const originalCID = CID.parse(cidStr);
  const fileContent = await fetchIPFSBuffer(cidStr, gateway);
  const computedCID = await calculateCID(fileContent);

  if (!computedCID.equals(originalCID)) {
    throw new Error(
      `CID mismatch! Expected ${originalCID}, but got ${computedCID}`,
    );
  }

  logInfo(`✅ CID verified successfully: ${computedCID}`);
  return fileContent;
};
