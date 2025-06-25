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
  data: {
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
  };
};

const endpoints = {
  genesis: 'eth/v1/beacon/genesis',
  beaconHeader: (blockId: BlockId): string =>
    `eth/v1/beacon/headers/${blockId}`,
  beaconHeadersByParentRoot: (parentRoot: RootHex): string =>
    `eth/v1/beacon/headers?parent_root=${parentRoot}`,
  state: (stateId: StateId): string => `eth/v2/debug/beacon/states/${stateId}`,
  validatorInfo: (validatorPubkey: Hex): string =>
    `eth/v1/beacon/states/head/validators/${validatorPubkey}`,
};

export const SupportedFork = {
  capella: 'capella',
  deneb: 'deneb',
  electra: 'electra',
};

export const fetchBeaconHeader = async (stateId: StateId, clURL?: string) => {
  const url = clURL || getConfig().CL_URL;

  try {
    const beaconHeaderResp = await fetch(
      `${url}${endpoints.beaconHeader(stateId)}`,
    );

    return beaconHeaderResp.json();
  } catch (error) {
    printError(error, 'Error fetching beacon header');
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

  try {
    const beaconStateResp = await fetch(`${url}${endpoints.state(stateId)}`, {
      headers: { accept: 'application/octet-stream' },
    });

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

export const fetchBeaconHeaderByParentRoot = async (
  parentRoot: RootHex,
  clURL?: string,
) => {
  const url = clURL || getConfig().CL_URL;

  try {
    const beaconHeaderResp = await fetch(
      `${url}${endpoints.beaconHeadersByParentRoot(parentRoot)}`,
    );

    return beaconHeaderResp.json();
  } catch (error) {
    printError(error, 'Error fetching beacon header by parent root');

    throw error;
  }
};

export const fetchValidatorInfo = async (
  validatorPubkey: Hex,
  clURL?: string,
): Promise<ValidatorInfo> => {
  const url = clURL || getConfig().CL_URL;

  try {
    const validatorInfoResp = await fetch(
      `${url}${endpoints.validatorInfo(validatorPubkey)}`,
    );

    return validatorInfoResp.json();
  } catch (error) {
    printError(error, 'Error fetching validator info');
    throw error;
  }
};
