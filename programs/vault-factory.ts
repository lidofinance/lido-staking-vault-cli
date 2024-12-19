import { Address } from "viem";
import { getVaultFactoryContract } from "@contracts";
import { program } from "@command";
import { getAccount } from "@providers";
import { ChainOption } from "@types";
import {getChainId, getDeployedAddress} from "@configs";

const vaultFactory = program.command("vf").description("vault factory contract");

vaultFactory
  .command("create-vault")
  .description("create vault contract and assign manager and operator")
  .option("-c, --chainId <chainId>", "chainId")
  .option("-m, --manager <manager>", "manager address")
  .option("-o, --operator <operator>", "operator address")
  .argument("<ownerFee>", "Vault owner fee, for e.g. 100 == 1%")
  .argument("<operatorFee>", "Node operator fee, for e.g. 100 == 1%")
  .action(
    async (
      ownerFee: string,
      operatorFee: string,
      { chainId, manager, operator }: ChainOption & { manager: Address, operator: Address }
    ) => {
      const contract = getVaultFactoryContract(chainId);
      const managementFee = BigInt(ownerFee);
      const performanceFee = BigInt(operatorFee);
      const chain = chainId ?? getChainId()

      const tx = await contract.write.createVault(
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
          account: getAccount(chain),
          chain,
        }
      );

      console.table({ 'Vault': tx });
    }
  );
