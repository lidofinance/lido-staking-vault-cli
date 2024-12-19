import { Address } from "viem";
import { getVaultFactoryContract } from "@contracts";
import { program } from "@command";
import { getAccount } from "@providers";
import { ChainOption } from "@types";

const vaulFactory = program.command("vf").description("vault factory contract");

vaulFactory
  .command("create-vault")
  .description("create vault contract and assign manager and operator")
  .option("-c, --chainId <chainId>", "chainId")
  .option("-m, --manager <manager>", "managerAddress")
  .option("-o, --operator <operator>", "operatorAddress")
  .action(async ({ chainId }: ChainOption) => {
    const contract = getVaultFactoryContract(chainId);
    const tx = contract.write
  });
