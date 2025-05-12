import { ssz } from '@lodestar/types';

import { logResult } from 'utils';

const SupportedFork = {
  deneb: 'deneb',
  electra: 'electra',
};

export const getFirstValidatorGIndex = (forks: string[]) => {
  const gIndexes: Record<string, string> = {};
  for (const fork of forks) {
    const Fork = ssz[fork as keyof typeof SupportedFork];
    const Validators = Fork.BeaconState.getPathInfo(['validators']).type;

    const gI = pack(
      Fork.BeaconState.getPathInfo(['validators', 0]).gindex,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Validators.limit,
    );
    gIndexes[fork] = toBytes32String(gI);
  }
  logResult({
    data: Object.entries(gIndexes).map(([fork, gIndex]) => [fork, gIndex]),
    params: {
      head: ['Fork', 'GIndex'],
    },
  });
};

const pack = (gI: bigint, limit: number) => {
  const width = limit ? BigInt(Math.log2(limit)) : 0n;
  return (gI << 8n) | width;
};

const toBytes32String = (gI: bigint) => {
  return `0x${gI.toString(16).padStart(64, '0')}`;
};
