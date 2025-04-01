import { encodeAbiParameters, Hex, keccak256 } from 'viem';
import { LeafDataFields } from 'utils';

const encoding = [
  { type: 'address', name: 'vault_address' },
  { type: 'uint256', name: 'valuation_wei' },
  { type: 'uint256', name: 'in_out_delta' },
  { type: 'uint256', name: 'fee' },
  { type: 'uint256', name: 'shares_minted' },
];

const getLeafInput = (vault: LeafDataFields) => [
  vault.vault_address,
  BigInt(vault.valuation_wei),
  BigInt(vault.in_out_delta),
  BigInt(vault.fee),
  BigInt(vault.shares_minted),
];

export const getReportLeaf = (input: LeafDataFields): Hex => {
  const encoded = encodeAbiParameters(encoding, getLeafInput(input));

  const leaf = keccak256(keccak256(encoded));
  return leaf;
};
