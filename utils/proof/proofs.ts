import { toHex, Hex, fromHex } from 'viem';
import {
  Proof,
  SingleProof,
  ProofType,
  createProof,
  Node,
} from '@chainsafe/persistent-merkle-tree';
import { ssz } from '@lodestar/types';

import { getPubkeyWCParentGIndex } from './merkle-utils.js';

type View =
  | ReturnType<(typeof ssz)['capella']['BeaconState']['deserializeToView']>
  | ReturnType<(typeof ssz)['deneb']['BeaconState']['deserializeToView']>
  | ReturnType<(typeof ssz)['electra']['BeaconState']['deserializeToView']>;
type Validator = ReturnType<View['validators']['getReadonly']>;

const SupportedFork = {
  capella: 'capella',
  deneb: 'deneb',
  electra: 'electra',
};

export type BeaconHeaderResponse = {
  slot: number;
  proposer_index: number;
  parent_root: Hex;
  state_root: Hex;
  body_root: Hex;
};

export const createPubkeyWCProof = async (validatorNode: Node) => {
  const pubkeyWCProof: Proof = createProof(validatorNode, {
    type: ProofType.single,
    gindex: getPubkeyWCParentGIndex(),
  }) as SingleProof;

  return { proof: pubkeyWCProof };
};

export const createStateProof = async (
  validatorIndex: number,
  bodyBytes: ArrayBuffer,
  forkName: keyof typeof SupportedFork,
): Promise<{ proof: SingleProof; validator: Validator; view: View }> => {
  const stateView = ssz[forkName].BeaconState.deserializeToView(
    new Uint8Array(bodyBytes),
  );

  if (validatorIndex >= stateView.validators.length)
    throw new Error(`ValidatorIndex ${validatorIndex} out of range`);

  const validator = stateView.validators.getReadonly(Number(validatorIndex));
  const gIValidator = stateView.type.getPathInfo([
    'validators',
    Number(validatorIndex),
  ]).gindex;
  const validatorStateProof: Proof = createProof(stateView.node, {
    type: ProofType.single,
    gindex: gIValidator,
  }) as SingleProof;

  return { proof: validatorStateProof, validator, view: stateView };
};

export const createBeaconHeaderProof = async (
  beaconHeader: BeaconHeaderResponse,
) => {
  const beaconHeaderView = ssz['phase0'].BeaconBlockHeader.toView({
    slot: Number(beaconHeader.slot),
    proposerIndex: Number(beaconHeader.proposer_index),
    parentRoot: fromHex(beaconHeader.parent_root, 'bytes'),
    stateRoot: fromHex(beaconHeader.state_root, 'bytes'),
    bodyRoot: fromHex(beaconHeader.body_root, 'bytes'),
  });
  const gIndexBeaconHeader = beaconHeaderView.type.getPathInfo([
    'state_root',
  ]).gindex;
  const beaconHeaderProof = createProof(beaconHeaderView.node, {
    type: ProofType.single,
    gindex: gIndexBeaconHeader,
  }) as SingleProof;

  return {
    proof: beaconHeaderProof,
    root: toHex(beaconHeaderView.hashTreeRoot()),
  };
};
