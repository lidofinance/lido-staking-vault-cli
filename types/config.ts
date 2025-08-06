import { Address } from 'viem';

export interface Config {
  DEPLOYED: string;
  EL_URL?: string;
  CL_URL?: string;
  PRIVATE_KEY?: string;
  ACCOUNT_FILE?: string;
  ACCOUNT_FILE_PASSWORD?: string;
  CHAIN_ID: number;
  TOKEN_MANAGER?: Address;
  VOTING?: Address;
  WALLET_CONNECT_PROJECT_ID?: string;
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
