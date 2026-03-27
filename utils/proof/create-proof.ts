import { Hex, toHex } from 'viem';

import {
  fetchBeaconHeader,
  fetchBeaconState,
  fetchBeaconHeaderByParentRoot,
  logError,
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
  slot: bigint;
  proposerIndex: bigint;
}

export interface ValidatorWitnessWithWC extends ValidatorWitness {
  withdrawalCredentials: Hex;
  slot: bigint;
  proposerIndex: bigint;
  validator: {
    effectiveBalance: number;
    activationEpoch: number;
    slashed: boolean;
  };
}

const slotToTimestamp = (slot: number, genesisTimestamp: number): number => {
  return genesisTimestamp + slot * Number(SECONDS_PER_SLOT);
};

export const createPDGProof = async (
  validatorIndex: number,
  clURL?: string,
): Promise<ValidatorWitnessWithWC> => {
  const beaconHeaderJson = await fetchBeaconHeader('finalized', clURL);
  const beaconHeader = beaconHeaderJson.data.header.message;

  const { stateBodyBytes, forkName } = await fetchBeaconState(
    'finalized',
    clURL,
  );

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

  let headerByParentSlot;

  try {
    const headerByParentJson = await fetchBeaconHeaderByParentRoot(
      beaconHeaderRoot,
      clURL,
    );

    if (headerByParentJson?.data?.length <= 0) {
      throw new Error('Child block (N+1) missing (Missed slot or API lag)');
    }

    headerByParentSlot = headerByParentJson.data[0].header.message.slot;
  } catch {
    logError(
      'Error fetching beacon header by parent root. Calculating child block timestamp manually...',
    );
    // We made a fallback so that the child block is not found (API returns empty), the code
    // calculates the expected timestamp based on the protocol rule (Genesis Time + Slot * 12s). This
    // should mean the PDG proof submission succeeds even if the network tip is unstable or the API
    // is lagging.
    // Child block (N+1) missing (Missed slot or API lag): Fallback to calculation manually.
    headerByParentSlot = Number(beaconHeader.slot) + 1;
  }

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
    slot: BigInt(beaconHeader.slot),
    proposerIndex: BigInt(beaconHeader.proposer_index),
    validator: {
      effectiveBalance: validator.effectiveBalance,
      activationEpoch: validator.activationEpoch,
      slashed: validator.slashed,
    },
  };

  return result;
};
