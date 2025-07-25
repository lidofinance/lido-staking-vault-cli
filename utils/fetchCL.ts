import { RootHex, Slot } from '@lodestar/types';

import { getConfig } from 'configs';
import { printError } from 'utils';
import { Hex } from 'viem';

export type BlockId = RootHex | Slot | 'head' | 'genesis' | 'finalized';
export type StateId =
  | RootHex
  | Slot
  | 'head'
  | 'genesis'
  | 'finalized'
  | 'justified';

type ValidatorInfo = {
  execution_optimistic: boolean;
  finalized: boolean;
  data: [
    {
      index: string;
      balance: string;
      status: string;
      validator: {
        pubkey: string;
        withdrawal_credentials: string;
        effective_balance: string;
        slashed: boolean;
        activation_eligibility_epoch: string;
        activation_epoch: string;
        exit_epoch: string;
        withdrawable_epoch: string;
      };
    },
  ];
};

type FinalityCheckpoints = {
  execution_optimistic: boolean;
  finalized: boolean;
  data: {
    previous_justified: {
      epoch: string;
      root: string;
    };
    current_justified: {
      epoch: string;
      root: string;
    };
    finalized: {
      epoch: string;
      root: string;
    };
  };
};

const endpoints = {
  finalityCheckpoints: 'eth/v1/beacon/states/head/finality_checkpoints',
  genesis: 'eth/v1/beacon/genesis',
  beaconHeader: (blockId: BlockId): string =>
    `eth/v1/beacon/headers/${blockId}`,
  beaconHeadersByParentRoot: (parentRoot: RootHex): string =>
    `eth/v1/beacon/headers?parent_root=${parentRoot}`,
  state: (stateId: StateId): string => `eth/v2/debug/beacon/states/${stateId}`,
  validatorInfo: (validatorPubkeys: string): string =>
    `eth/v1/beacon/states/head/validators${validatorPubkeys}`,
};

export const SupportedFork = {
  capella: 'capella',
  deneb: 'deneb',
  electra: 'electra',
};

export const finalityCheckpoints = async (
  clURL?: string,
): Promise<FinalityCheckpoints> => {
  const url = clURL || getConfig().CL_URL;
  if (!url) {
    throw new Error('CL_URL is not set. CL_URL is required for fetching epoch');
  }
  try {
    const epochResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.finalityCheckpoints}`,
    );
    return epochResp.json();
  } catch (error) {
    printError(
      error,
      `Error fetching finality_сheckpoints. Used URL: ${url}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );
    throw error;
  }
};

export const fetchBeaconHeader = async (stateId: StateId, clURL?: string) => {
  const url = clURL || getConfig().CL_URL;

  if (!url) {
    throw new Error(
      'CL_URL is not set. CL_URL is required for fetching beacon header',
    );
  }

  try {
    const beaconHeaderResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.beaconHeader(stateId)}`,
    );

    return beaconHeaderResp.json();
  } catch (error) {
    printError(
      error,
      `Error fetching beacon header. Used URL: ${url}, stateId: ${stateId}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );
    throw error;
  }
};

export const fetchBeaconState = async (
  stateId: StateId,
  clURL?: string,
): Promise<{
  stateBodyBytes: ArrayBuffer;
  forkName: keyof typeof SupportedFork;
}> => {
  const url = clURL || getConfig().CL_URL;

  if (!url) {
    throw new Error(
      'CL_URL is not set. CL_URL is required for fetching beacon state',
    );
  }

  try {
    const beaconStateResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.state(stateId)}`,
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
    printError(
      error,
      `Error fetching beacon state. Used URL: ${url}, stateId: ${stateId}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );
    throw error;
  }
};

export const fetchBeaconHeaderByParentRoot = async (
  parentRoot: RootHex,
  clURL?: string,
) => {
  const url = clURL || getConfig().CL_URL;

  if (!url) {
    throw new Error(
      'CL_URL is not set. CL_URL is required for fetching beacon header by parent root',
    );
  }

  try {
    const beaconHeaderResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.beaconHeadersByParentRoot(parentRoot)}`,
    );

    return beaconHeaderResp.json();
  } catch (error) {
    printError(
      error,
      `Error fetching beacon header by parent root. Used URL: ${url}, parentRoot: ${parentRoot}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );

    throw error;
  }
};

export const fetchValidatorInfo = async (
  validatorPubkeys: Hex[],
  clURL?: string,
): Promise<ValidatorInfo> => {
  const url = clURL || getConfig().CL_URL;

  if (!url) {
    throw new Error(
      'CL_URL is not set. CL_URL is required for fetching validator info',
    );
  }

  try {
    const validatorInfoResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.validatorInfo('?id=' + validatorPubkeys.join(','))}`,
    );

    return validatorInfoResp.json();
  } catch (error) {
    printError(
      error,
      `Error fetching validator info. Used URL: ${url}, validatorPubkey: ${validatorPubkey}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );
    throw error;
  }
};
