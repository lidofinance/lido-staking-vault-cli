import {getChain, getChainId, getDeployedAddress} from "@configs";
import { getAccount } from "@providers";
import { VaultPayload } from "@types";
import { getVaultFactoryContract } from "@contracts";

export async function* createVault({
  chainId,
  manager,
  operator,
  quantity,
  managementFee,
  performanceFee,
}: VaultPayload) {
  const id = chainId ?? getChainId()
  const contract = getVaultFactoryContract(id);
  const chain = getChain(id);

  for (let _ of Array.from(Array(quantity))) {
    yield await contract.write.createVault(
      [
        '0x',
        {
          managementFee,
          performanceFee,
          manager,
          operator,
        },
        getDeployedAddress('app:aragon-agent'),
      ],
      {
        account: getAccount(chain.id),
        chain,
      }
    );
  }
}
