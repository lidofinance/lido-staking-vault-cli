import { waitForTransactionReceipt } from "viem/actions";
import { getChain } from "@configs";
import { getAccount } from "@providers";
import { VaultPayload } from "@types";
import { getVaultFactoryContract } from "@contracts";

export const createVault = async (payload: VaultPayload) => {
  const { contract, client } = getVaultFactoryContract();

  const tx = await contract.write.createVault(
    [
      { ...payload },
      '0x'
    ],
    {
      account: getAccount(),
      chain: getChain(),
    }
  );

  const receipt = await waitForTransactionReceipt(client, { hash: tx });

  console.log('createVault::receipt', receipt);

  return tx;
}
