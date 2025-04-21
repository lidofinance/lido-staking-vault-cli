import { Address } from 'viem';

export interface Config {
  DEPLOYED: string;
  EL_URL?: string;
  CL_URL?: string;
  PRIVATE_KEY?: string;
  CHAIN_ID: number;
  TOKEN_MANAGER?: Address;
  VOTING?: Address;
}

export type Vote = readonly [
  boolean,
  boolean,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  bigint,
  `0x${string}`,
  number,
];
