import { encodeAbiParameters, Hex, keccak256, concatHex } from 'viem';
import { LeafDataFields } from 'utils';

export const DOUBLE_HASH = (data: Hex): Hex => keccak256(keccak256(data));
export const hashNode = (a: Hex, b: Hex): Hex => {
  const [left, right] = a < b ? [a, b] : [b, a];
  return keccak256(concatHex([left, right]));
};

const encoding = [
  { type: 'address', name: 'vault_address' },
  { type: 'uint256', name: 'total_value_wei' },
  { type: 'uint256', name: 'in_out_delta' },
  { type: 'uint256', name: 'fee' },
  { type: 'uint256', name: 'liability_shares' },
];

const getLeafInput = (vault: LeafDataFields) => [
  vault.vault_address,
  BigInt(vault.total_value_wei),
  BigInt(vault.fee),
  BigInt(vault.liability_shares),
  BigInt(vault.slashing_reserve),
];

export const getReportLeaf = (input: LeafDataFields): Hex => {
  const encoded = encodeAbiParameters(encoding, getLeafInput(input));

  const leaf = DOUBLE_HASH(encoded);
  return leaf;
};
