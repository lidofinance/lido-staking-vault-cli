import { pad, bytesToHex, type Hex, hexToBytes, sha256 } from 'viem';
import {
  fromHexString,
  ByteVectorType,
  ContainerType,
  UintNumberType,
} from '@chainsafe/ssz';
import { PublicKey, Signature, verify } from '@chainsafe/blst';

type DepositStruct = {
  pubkey: Hex;
  signature: Hex;
  amount: bigint;
  depositDataRoot: Hex;
};

const ONE_GWEI = 1_000_000_000n;

const toHexString = (value: unknown): string => {
  if (typeof value === 'string' && !value.startsWith('0x')) {
    return `0x${value}`;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return `0x${value.toString(16)}`;
  }

  if (value instanceof Uint8Array) {
    return `0x${Buffer.from(value).toString('hex')}`;
  }

  throw new Error('Unsupported value type');
};

const formatAmount = (amount: bigint) => {
  const gweiAmount = amount / ONE_GWEI;
  return Buffer.from(gweiAmount.toString(16), 'hex').reverse().toString('hex');
};

const computeDepositDomain = () => {
  const ZERO_HASH = Buffer.alloc(32, 0);
  const DOMAIN_DEPOSIT = Uint8Array.from([3, 0, 0, 0]);

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

  return computeDomain(DOMAIN_DEPOSIT, fromHexString('0x00000000'), ZERO_HASH);
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
    pubkey: BLSPubkey.fromJson(toHexString(pubkey)),
    withdrawalCredentials: Bytes32.fromJson(toHexString(withdrawalCredentials)),
    amount: UintNum64.fromJson(amount / 1000000000n),
  };

  const domain = computeDepositDomain();

  return SigningData.hashTreeRoot({
    objectRoot: DepositMessage.hashTreeRoot(depositMessage),
    domain,
  });
};

const computeDepositDataRoot = (
  _withdrawalCredentials: Hex,
  _pubkey: Hex,
  _signature: Hex,
  amount: bigint,
) => {
  const withdrawalCredentials = hexToBytes(_withdrawalCredentials);
  const pubkey = hexToBytes(_pubkey);
  const signature = hexToBytes(_signature);

  const pubkeyRoot = sha256(pad(pubkey, { dir: 'right', size: 64 })).slice(2);

  const sigSlice1root = sha256(
    pad(signature.slice(0, 64), { dir: 'right', size: 64 }),
  ).slice(2);
  const sigSlice2root = sha256(
    pad(signature.slice(64), { dir: 'right', size: 64 }),
  ).slice(2);
  const sigRoot = sha256(`0x${sigSlice1root}${sigSlice2root}`).slice(2);

  const sizeInGweiLE64 = formatAmount(BigInt(amount));

  const pubkeyCredsRoot = sha256(
    `0x${pubkeyRoot}${toHexString(withdrawalCredentials).slice(2)}`,
  ).slice(2);
  const sizeSigRoot = sha256(
    `0x${sizeInGweiLE64}${'00'.repeat(24)}${sigRoot}`,
  ).slice(2);
  return sha256(`0x${pubkeyCredsRoot}${sizeSigRoot}`);
};

export const isValidDeposit = (
  deposit: DepositStruct,
  withdrawalCredentials: Hex,
) => {
  const depositDataRoot = computeDepositDataRoot(
    withdrawalCredentials,
    deposit.pubkey,
    deposit.signature,
    deposit.amount,
  );
  if (depositDataRoot != deposit.depositDataRoot) {
    return {
      isValid: false,
      reason: 'Deposit data root mismatch',
    };
  }

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
  if (!isBLSValid) {
    return {
      isValid: false,
      reason: 'BLS signature mismatch',
    };
  }

  return { isValid: true };
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
