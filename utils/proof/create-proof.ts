import { Hex, toHex } from 'viem';
import { RootHex, Slot } from '@lodestar/types';
import { getConfig } from 'configs';

import {
  createStateProof,
  createPubkeyWCProof,
  createBeaconHeaderProof,
} from './proofs.js';

const SECONDS_PER_SLOT = 12;

interface ValidatorWitness {
  proof: Hex[];
  pubkey: Hex;
  validatorIndex: bigint;
  childBlockTimestamp: bigint;
  withdrawalCredentials: Hex;
}

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
const SupportedFork = {
  capella: 'capella',
  deneb: 'deneb',
  electra: 'electra',
};

const slotToTimestamp = (slot: number, genesisTimestamp: number): number => {
  return genesisTimestamp + slot * Number(SECONDS_PER_SLOT);
};

export const createPDGProof = async (
  validatorIndex: number,
): Promise<ValidatorWitness> => {
  const { clLink } = getConfig();

  const beaconHeaderResp = await fetch(
    `${clLink}${endpoints.beaconHeader('finalized')}`,
  );
  const beaconHeaderJson = await beaconHeaderResp.json();
  const beaconHeader = beaconHeaderJson.data.header.message;

  const stateResp = await fetch(`${clLink}${endpoints.state('finalized')}`, {
    headers: { accept: 'application/octet-stream' },
  });
  const { headers } = stateResp;
  const forkName = headers.get('eth-consensus-version') as string;

  // Checks
  if (!(forkName in SupportedFork))
    throw new Error(`Fork name [${forkName}] is not supported`);
  const bodyBytes = await stateResp.arrayBuffer();
  if (!bodyBytes) throw new Error('Body bytes are not found');

  // Proofs

  // Beacon Header Proof
  const { proof: beaconHeaderProof, root: beaconHeaderRoot } =
    await createBeaconHeaderProof(beaconHeader);

  // Validator State Proof
  const {
    proof: validatorStateProof,
    validator,
    view: validatorStateView,
  } = await createStateProof(
    validatorIndex,
    bodyBytes,
    forkName as keyof typeof SupportedFork,
  );

  // Pubkey WC Proof
  const { proof: pubkeyWCProof } = await createPubkeyWCProof(validator.node);

  // Concatenate proofs
  const proofConcat = [
    ...pubkeyWCProof.witnesses,
    ...validatorStateProof.witnesses,
    ...beaconHeaderProof.witnesses,
  ];

  const proofHex: Hex[] = proofConcat.map((w) => toHex(w));

  const headerByParentResp = await fetch(
    `${clLink}${endpoints.beaconHeadersByParentRoot(beaconHeaderRoot)}`,
  );
  const headerByParentJson = await headerByParentResp.json();
  const headerByParentSlot = headerByParentJson.data[0].header.message.slot;
  const headerByParentTimestamp = slotToTimestamp(
    headerByParentSlot,
    validatorStateView.genesisTime,
  );

  const result = {
    proof: proofHex,
    pubkey: toHex(validator.pubkey),
    withdrawalCredentials: toHex(validator.withdrawalCredentials),
    validatorIndex: BigInt(validatorIndex),
    childBlockTimestamp: BigInt(headerByParentTimestamp),
  };

  return result;
};
