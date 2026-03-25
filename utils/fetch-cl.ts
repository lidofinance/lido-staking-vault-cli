import { RootHex, Slot } from '@lodestar/types';

import { getConfig } from 'configs';
import { logError } from './logging/console.js';
import { printError } from './error-handler.js';
import { Hex } from 'viem';

import { SupportedFork } from './proof/constants.js';

export type BlockId = RootHex | Slot | 'head' | 'genesis' | 'finalized';
export type StateId =
  | RootHex
  | Slot
  | 'head'
  | 'genesis'
  | 'finalized'
  | 'justified';

export type ValidatorsInfo = {
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

export type NodeSyncingStatus = {
  data: {
    head_slot: string;
    sync_distance: string;
    is_syncing: boolean;
    is_optimistic: boolean;
    el_offline: boolean;
  };
};

const isFinalityCheckpoints = (
  obj: FinalityCheckpoints,
): obj is FinalityCheckpoints => {
  return (
    obj &&
    typeof obj === 'object' &&
    isBool(obj.execution_optimistic) &&
    isBool(obj.finalized) &&
    isFinalityCheckpointsData(obj.data)
  );
};

const isFinalityCheckpointsData = (
  obj: any,
): obj is {
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
} => {
  return (
    obj &&
    typeof obj === 'object' &&
    isString(obj.previous_justified.epoch) &&
    isString(obj.previous_justified.root) &&
    isString(obj.current_justified.epoch) &&
    isString(obj.current_justified.root) &&
    isString(obj.finalized.epoch) &&
    isString(obj.finalized.root)
  );
};

const isString = (v: unknown): v is string => typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

const isValidator = (
  obj: any,
): obj is {
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
} => {
  return (
    obj &&
    typeof obj === 'object' &&
    isString(obj.index) &&
    isString(obj.balance) &&
    isString(obj.status) &&
    obj.validator &&
    typeof obj.validator === 'object' &&
    isString(obj.validator.pubkey) &&
    isString(obj.validator.withdrawal_credentials) &&
    isString(obj.validator.effective_balance) &&
    typeof obj.validator.slashed === 'boolean' &&
    isString(obj.validator.activation_eligibility_epoch) &&
    isString(obj.validator.activation_epoch) &&
    isString(obj.validator.exit_epoch) &&
    isString(obj.validator.withdrawable_epoch)
  );
};

const isValidatorsInfoArray = (obj: ValidatorsInfo): obj is ValidatorsInfo => {
  return (
    obj &&
    typeof obj === 'object' &&
    isBool(obj.execution_optimistic) &&
    isBool(obj.finalized) &&
    Array.isArray(obj.data) &&
    obj.data.every(isValidator)
  );
};

const validateResponse = (response: Response) => {
  if (!response.ok) {
    throw new Error(
      `HTTP error ${response.status}-${response.statusText}, URL(${response.url})`,
    );
  }
};

const getCLApiUrl = (clURL?: string): string => {
  const url = clURL || getConfig().CL_URL;

  if (!url) {
    throw new Error(
      'CL_URL is not set. CL_URL is required for fetching beacon header by parent root',
    );
  }
  return url;
};

const endpoints = {
  finalityCheckpoints: 'eth/v1/beacon/states/head/finality_checkpoints',
  genesis: 'eth/v1/beacon/genesis',
  beaconHeader: (blockId: BlockId): string =>
    `eth/v1/beacon/headers/${blockId}`,
  beaconHeadersByParentRoot: (parentRoot: RootHex): string =>
    `eth/v1/beacon/headers?parent_root=${parentRoot}`,
  state: (stateId: StateId): string => `eth/v2/debug/beacon/states/${stateId}`,
  validatorsInfo: (validatorsPubkeys: string): string =>
    `eth/v1/beacon/states/head/validators${validatorsPubkeys}`,
  nodeSyncing: 'eth/v1/node/syncing',
};

export const finalityCheckpoints = async (
  clURL?: string,
): Promise<FinalityCheckpoints> => {
  const url = getCLApiUrl(clURL);

  try {
    const epochResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.finalityCheckpoints}`,
    );

    validateResponse(epochResp);

    const body: FinalityCheckpoints = await epochResp.json();
    if (!isFinalityCheckpoints(body)) {
      throw new Error(
        `Response JSON is not of type FinalityCheckpoints.\nSnippet: ${JSON.stringify(body)}`,
      );
    }

    return body;
  } catch (error) {
    printError(
      error,
      `Error fetching finality_сheckpoints. Used URL: ${url}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );
    throw error;
  }
};

export const fetchBeaconHeader = async (stateId: StateId, clURL?: string) => {
  const url = getCLApiUrl(clURL);

  try {
    const beaconHeaderResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.beaconHeader(stateId)}`,
    );

    validateResponse(beaconHeaderResp);

    return await beaconHeaderResp.json();
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
  const url = getCLApiUrl(clURL);

  try {
    const beaconStateResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.state(stateId)}`,
      {
        headers: { accept: 'application/octet-stream' },
      },
    );

    validateResponse(beaconStateResp);

    const { headers } = beaconStateResp;
    const forkName = headers.get(
      'eth-consensus-version',
    ) as keyof typeof SupportedFork;

    // Checks
    if (!(forkName in SupportedFork)) {
      logError(
        `Looks like the CL headers don't contain the fork name (header: eth-consensus-version) or the fork name is not supported`,
      );
      throw new Error(`Fork name [${forkName}] is not supported`);
    }

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
  const url = getCLApiUrl(clURL);

  try {
    const beaconHeaderResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.beaconHeadersByParentRoot(parentRoot)}`,
    );

    validateResponse(beaconHeaderResp);

    return await beaconHeaderResp.json();
  } catch (error) {
    printError(
      error,
      `Error fetching beacon header by parent root. Used URL: ${url}, parentRoot: ${parentRoot}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );

    throw error;
  }
};

export const fetchValidatorsInfo = async (
  validatorPubkeys: Hex[],
  clURL?: string,
): Promise<ValidatorsInfo> => {
  const url = getCLApiUrl(clURL);

  try {
    const validatorsInfoResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.validatorsInfo('?id=' + validatorPubkeys.join(','))}`,
    );

    validateResponse(validatorsInfoResp);

    const body: ValidatorsInfo = await validatorsInfoResp.json();
    if (!isValidatorsInfoArray(body)) {
      throw new Error(
        `Response JSON is not of type ValidatorsInfo.\nSnippet: ${JSON.stringify(body)}`,
      );
    }

    return body;
  } catch (error) {
    printError(
      error,
      `Error fetching validator info. Used URL: ${url}, validatorPubkeys: ${validatorPubkeys}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );
    throw error;
  }
};

export const fetchNodeSyncingStatus = async (
  clURL?: string,
): Promise<NodeSyncingStatus> => {
  const url = getCLApiUrl(clURL);

  try {
    const syncingResp = await fetch(
      `${url.endsWith('/') ? url : url + '/'}${endpoints.nodeSyncing}`,
    );

    validateResponse(syncingResp);

    const body: NodeSyncingStatus = await syncingResp.json();
    return body;
  } catch (error) {
    printError(
      error,
      `Error fetching node syncing status. Used URL: ${url}. Please check if the CL_URL environment variable is correct or try to use another CL.`,
    );
    throw error;
  }
};
