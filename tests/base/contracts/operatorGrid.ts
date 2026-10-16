import {
  Address,
  getContract,
  GetContractReturnType,
  PublicClient,
} from 'viem';
import { OperatorGridAbi } from '../../../abi';
import { callReadMethodSilent, getClient } from '../providers';
import { getStandConfig } from '../config';

export const getOperatorGridContract = async (): Promise<
  GetContractReturnType<typeof OperatorGridAbi, PublicClient>
> => {
  const operatorGridContract = getStandConfig().contracts.operatorGrid;
  return getContract({
    address: operatorGridContract,
    abi: OperatorGridAbi,
    client: getClient(),
  });
};

export const getVaultTierInfo = async (vaultAddress: Address) => {
  const contract = await getOperatorGridContract();
  return await callReadMethodSilent(contract, 'vaultTierInfo', [vaultAddress]);
};
