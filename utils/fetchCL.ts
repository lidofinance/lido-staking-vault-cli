import { RootHex, Slot } from '@lodestar/types';

import { getConfig } from 'configs';
import { printError } from 'utils';

export type BlockId = RootHex | Slot | 'head' | 'genesis' | 'finalized';
export type StateId =
  | RootHex
  | Slot
  | 'head'
  | 'genesis'
  | 'finalized'
  | 'justified';

const endpoints = {
  genesis: 'eth/v1/beacon/genesis',
  beaconHeader: (blockId: BlockId): string =>
    `eth/v1/beacon/headers/${blockId}`,
  beaconHeadersByParentRoot: (parentRoot: RootHex): string =>
    `eth/v1/beacon/headers?parent_root=${parentRoot}`,
  state: (stateId: StateId): string => `eth/v2/debug/beacon/states/${stateId}`,
};

export const SupportedFork = {
  capella: 'capella',
  deneb: 'deneb',
  electra: 'electra',
};

export const fetchBeaconHeader = async (stateId: StateId) => {
  const { clLink } = getConfig();

  try {
    const beaconHeaderResp = await fetch(
      `${clLink}${endpoints.beaconHeader(stateId)}`,
    );

    return beaconHeaderResp.json();
  } catch (error) {
    printError(error, 'Error fetching beacon header');
    throw error;
  }
};

export const fetchBeaconState = async (
  stateId: StateId,
): Promise<{
  stateBodyBytes: ArrayBuffer;
  forkName: keyof typeof SupportedFork;
}> => {
  const { clLink } = getConfig();

  try {
    const beaconStateResp = await fetch(
      `${clLink}${endpoints.state(stateId)}`,
      {
        headers: { accept: 'application/octet-stream' },
      },
    );

    const { headers } = beaconStateResp;
    const forkName = headers.get(
      'eth-consensus-version',
    ) as keyof typeof SupportedFork;

    // Checks
    if (!(forkName in SupportedFork))
      throw new Error(`Fork name [${forkName}] is not supported`);

    const stateBodyBytes = await beaconStateResp.arrayBuffer();
    if (!stateBodyBytes)
      throw new Error('Beacon state body bytes are not found');

    return { stateBodyBytes, forkName };
  } catch (error) {
    printError(error, 'Error fetching beacon state');
    throw error;
  }
};

export const fetchBeaconHeaderByParentRoot = async (parentRoot: RootHex) => {
  const { clLink } = getConfig();

  try {
    const beaconHeaderResp = await fetch(
      `${clLink}${endpoints.beaconHeadersByParentRoot(parentRoot)}`,
    );

    return beaconHeaderResp.json();
  } catch (error) {
    printError(error, 'Error fetching beacon header by parent root');

    throw error;
  }
};
