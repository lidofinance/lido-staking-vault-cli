import { pad, bytesToHex, type Hex } from 'viem';
import { mainnet, sepolia, hoodi } from 'viem/chains';
import {
  fromHexString,
  ByteVectorType,
  ContainerType,
  UintNumberType,
} from '@chainsafe/ssz';
import { PublicKey, Signature, verify } from '@chainsafe/blst';

import { toHex } from './proof/merkle-utils.js';
import { getChain } from 'configs';

const FORK_VERSION_BY_CHAIN: Record<number, string> = {
  [sepolia.id]: '0x90000069', // https://github.com/eth-clients/sepolia
  [hoodi.id]: '0x10000910', // https://github.com/eth-clients/hoodi
  [mainnet.id]: '0x00000000', // https://github.com/eth-clients/mainnet
};

type DepositStruct = {
  pubkey: Hex;
  signature: Hex;
  amount: bigint;
  depositDataRoot: Hex;
};

export const computeDepositDomainByForkVersion = (forkVersion: string) => {
  const ZERO_HASH = Buffer.alloc(32, 0);
  const DOMAIN_DEPOSIT = Uint8Array.from([3, 0, 0, 0]);

  const forkVersionUint8Array = fromHexString(forkVersion);
  type ByteArray = Uint8Array;

  const Root = new ByteVectorType(32);
  const Bytes4 = new ByteVectorType(4);
  const Version = Bytes4;

  const ForkData = new ContainerType(
    {
      currentVersion: Version,
      genesisValidatorsRoot: Root,
    },
    { typeName: 'ForkData', jsonCase: 'eth2' },
  );

  const computeDomain = (
    domainType: ByteArray,
    forkVersion: ByteArray,
    genesisValidatorRoot: ByteArray,
  ): Uint8Array => {
    const forkDataRoot = computeForkDataRoot(forkVersion, genesisValidatorRoot);
    const domain = new Uint8Array(32);
    domain.set(domainType, 0);
    domain.set(forkDataRoot.slice(0, 28), 4);
    return domain;
  };

  const computeForkDataRoot = (
    currentVersion: ByteArray,
    genesisValidatorsRoot: ByteArray,
  ): Uint8Array => {
    return ForkData.hashTreeRoot({ currentVersion, genesisValidatorsRoot });
  };

  return computeDomain(DOMAIN_DEPOSIT, forkVersionUint8Array, ZERO_HASH);
};

export const computeDepositDomain = () => {
  const forkByChain = FORK_VERSION_BY_CHAIN[getChain().id];

  if (!forkByChain) {
    throw new Error(`Fork version not found for chain ${getChain().id}`);
  }

  return computeDepositDomainByForkVersion(forkByChain);
};

const computeDepositMessageRoot = (
  pubkey: string,
  withdrawalCredentials: string,
  amount: bigint,
): Uint8Array => {
  const Bytes48 = new ByteVectorType(48);
  const Bytes32 = new ByteVectorType(32);
  const UintNum64 = new UintNumberType(8);
  const Root = new ByteVectorType(32);
  const Domain = Bytes32;

  const BLSPubkey = Bytes48;

  const DepositMessage = new ContainerType(
    { pubkey: BLSPubkey, withdrawalCredentials: Bytes32, amount: UintNum64 },
    { typeName: 'DepositMessage', jsonCase: 'eth2' },
  );

  const SigningData = new ContainerType(
    {
      objectRoot: Root,
      domain: Domain,
    },
    { typeName: 'SigningData', jsonCase: 'eth2' },
  );

  const depositMessage = {
    pubkey: BLSPubkey.fromJson(toHex(pubkey)),
    withdrawalCredentials: Bytes32.fromJson(toHex(withdrawalCredentials)),
    amount: UintNum64.fromJson(amount / 1000000000n),
  };

  const domain = computeDepositDomain();

  return SigningData.hashTreeRoot({
    objectRoot: DepositMessage.hashTreeRoot(depositMessage),
    domain,
  });
};

export const isValidBLSDeposit = (
  deposit: DepositStruct,
  withdrawalCredentials: Hex,
) => {
  const signningRoot = computeDepositMessageRoot(
    deposit.pubkey,
    withdrawalCredentials,
    deposit.amount,
  );

  const isBLSValid = verify(
    signningRoot,
    PublicKey.fromHex(deposit.pubkey),
    Signature.fromHex(deposit.signature),
    true,
    true,
  );

  return isBLSValid;
};

export const expandBLSSignature = (signature: Hex, pubkey: Hex) => {
  const pubkeyY = PublicKey.fromHex(pubkey).toBytes(false).slice(48);

  // pad Y.a to 32 bytes to match Fp struct
  const pubkeyY_a = bytesToHex(
    pad(pubkeyY.slice(0, 16), { dir: 'left', size: 32 }),
  );
  const pubkeyY_b = bytesToHex(
    pad(pubkeyY.slice(16), { dir: 'left', size: 32 }),
  );

  const signatureY = Signature.fromHex(signature).toBytes(false).slice(96);

  // first Fp of Y coordinate is last 48 bytes of signature
  const sigY_c0 = signatureY.slice(48);
  const sigY_c0_a = bytesToHex(
    pad(sigY_c0.slice(0, 16), {
      dir: 'left',
      size: 32,
    }),
  );
  const sigY_c0_b = bytesToHex(
    pad(sigY_c0.slice(16), { dir: 'left', size: 32 }),
  );
  // second Fp is 48 bytes before first one
  const sigY_c1 = signatureY.slice(0, 48);
  const sigY_c1_a = bytesToHex(
    pad(sigY_c1.slice(0, 16), {
      dir: 'left',
      size: 32,
    }),
  );
  const sigY_c1_b = bytesToHex(
    pad(sigY_c1.slice(16), { dir: 'left', size: 32 }),
  );

  return {
    pubkey,
    pubkeyY_a,
    pubkeyY_b,
    signature,
    sigY_c0_a,
    sigY_c0_b,
    sigY_c1_a,
    sigY_c1_b,
  };
};
