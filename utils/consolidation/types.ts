import { Hex } from 'viem';

export type ValidatorInfo = {
  status: string;
  balance: bigint;
  index: string;
};

export type PubkeyMap = Record<Hex, Hex[]>;

export type TargetAndSourceValidators = Map<
  Hex,
  {
    info: ValidatorInfo;
    sourceValidators: Map<Hex, ValidatorInfo>;
  }
>;
