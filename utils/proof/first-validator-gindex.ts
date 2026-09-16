import { ssz } from '@lodestar/types';
import {
  ListCompositeType,
  ProgressiveListCompositeType,
} from '@chainsafe/ssz';

import { logResult } from 'utils';

import { SupportedFork } from './constants.js';

// Verifier constant each gindex must match, see CLGIndices.sol
const PRE_GLOAS_CONSTANT = 'FIRST_VALIDATOR_PRE_GLOAS';
const GLOAS_CONSTANT = 'VALIDATORS';

export const getFirstValidatorGIndex = (forks: string[]) => {
  const rows = forks.map((fork) => {
    const Fork = ssz[fork as keyof typeof SupportedFork];
    if (!Fork) throw new Error(`Fork name [${fork}] is not supported`);

    const validators = Fork.BeaconState.getPathInfo(['validators']);

    // Gloas: the list is progressive, so it has no fixed depth to pack. The
    // verifier takes the validators field itself and derives each node.
    if (validators.type instanceof ProgressiveListCompositeType) {
      return [
        fork,
        toBytes32String(pack(validators.gindex, 0n)),
        GLOAS_CONSTANT,
      ];
    }

    if (!(validators.type instanceof ListCompositeType)) {
      throw new TypeError(`Unexpected validators type for fork [${fork}]`);
    }

    const gI = Fork.BeaconState.getPathInfo(['validators', 0]).gindex;
    return [
      fork,
      toBytes32String(pack(gI, widthOf(validators.type.limit))),
      PRE_GLOAS_CONSTANT,
    ];
  });

  logResult({
    data: rows,
    params: {
      head: ['Fork', 'GIndex', 'CLGIndices constant'],
    },
  });
};

const widthOf = (limit: number) => (limit ? BigInt(Math.log2(limit)) : 0n);

const pack = (gI: bigint, width: bigint) => {
  return (gI << 8n) | width;
};

const toBytes32String = (gI: bigint) => {
  return `0x${gI.toString(16).padStart(64, '0')}`;
};
