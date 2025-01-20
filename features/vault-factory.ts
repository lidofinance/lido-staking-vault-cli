import { waitForTransactionReceipt } from "viem/actions";
import { parseEventLogs } from "viem";
import { getChain } from "@configs";
import { getAccount } from "@providers";
import { VaultPayload } from "@types";
import { getVaultFactoryContract } from "@contracts";
import { VaultFactoryAbi } from "abi";

export const createVault = async (payload: VaultPayload) => {
  const { contract, client } = getVaultFactoryContract();
  const chain = getChain();

  const tx = await contract.write.createVault(
    [
      { ...payload },
      '0x'
    ],
    {
      account: getAccount(),
      chain,
    }
  );

  const receipt = await waitForTransactionReceipt(client, { hash: tx });
  const events = parseEventLogs({
    abi: VaultFactoryAbi,
    logs: receipt.logs,
  });

  const vaultEvent = events.find(event => event.eventName === 'VaultCreated');
  const vault = vaultEvent?.args.vault;
  const delegation = vaultEvent?.args.owner;

  return {
    vault,
    delegation,
    tx,
    blockNumber: receipt.blockNumber,
  };
}
