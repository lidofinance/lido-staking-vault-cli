import { Hex, toHex } from 'viem';

import {
  fetchBeaconHeader,
  fetchBeaconState,
  fetchBeaconHeaderByParentRoot,
} from 'utils';

import {
  createStateProof,
  createPubkeyWCProof,
  createBeaconHeaderProof,
} from './proofs.js';

const SECONDS_PER_SLOT = 12;

export interface ValidatorWitness {
  proof: Hex[];
  pubkey: Hex;
  validatorIndex: bigint;
  childBlockTimestamp: bigint;
}

interface ValidatorWitnessWithWC extends ValidatorWitness {
  withdrawalCredentials: Hex;
}

const slotToTimestamp = (slot: number, genesisTimestamp: number): number => {
  return genesisTimestamp + slot * Number(SECONDS_PER_SLOT);
};

export const createPDGProof = async (
  validatorIndex: number,
): Promise<ValidatorWitnessWithWC> => {
  const beaconHeaderJson = await fetchBeaconHeader('finalized');
  const beaconHeader = beaconHeaderJson.data.header.message;

  const { stateBodyBytes, forkName } = await fetchBeaconState('finalized');

  // Proofs

  // Beacon Header Proof
  const { proof: beaconHeaderProof, root: beaconHeaderRoot } =
    await createBeaconHeaderProof(beaconHeader);

  // Validator State Proof
  const {
    proof: validatorStateProof,
    validator,
    view: validatorStateView,
  } = await createStateProof(validatorIndex, stateBodyBytes, forkName);

  // Pubkey WC Proof
  const { proof: pubkeyWCProof } = await createPubkeyWCProof(validator.node);

  // Concatenate proofs
  const proofConcat = [
    ...pubkeyWCProof.witnesses,
    ...validatorStateProof.witnesses,
    ...beaconHeaderProof.witnesses,
  ];

  const proofHex: Hex[] = proofConcat.map((w) => toHex(w));

  const headerByParentJson =
    await fetchBeaconHeaderByParentRoot(beaconHeaderRoot);
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
