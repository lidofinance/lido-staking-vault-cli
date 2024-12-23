import { Address, isAddress, isAddressEqual } from "viem";
import { program } from "@command";
import { ChainOption } from "@types";
import { createVault } from "@features";

const vaultFactory = program.command("vf").description("vault factory contract");

vaultFactory
  .command("create-vault")
  .description("create vault contract and assign manager and operator")
  .option("-c, --chainId <chainId>", "chainId")
  .option("-m, --manager <manager>", "manager address")
  .option("-o, --operator <operator>", "operator address")
  .option("-q, --quantity <quantity>", "quantity of vaults to create, default 1, max 10")
  .argument("<ownerFee>", "Vault owner fee, for e.g. 100 == 1%")
  .argument("<operatorFee>", "Node operator fee, for e.g. 100 == 1%")
  .action(
    async (
      ownerFee: string,
      operatorFee: string,
      { chainId, manager, operator, quantity = '1' }: ChainOption & { manager: Address, operator: Address, quantity: string }
    ) => {
      const managementFee = BigInt(ownerFee);
      const performanceFee = BigInt(operatorFee);
      const qnt = parseInt(quantity);

      if (!isAddress(manager)) {
        program.error("manager address is not valid", { exitCode: 1 });
      }

      if (!isAddress(operator)) {
        program.error("operator address is not valid", { exitCode: 1 });
      }

      if (isAddressEqual(manager, operator)) {
        program.error("manager address can't be equal operator address", { exitCode: 1 });
      }

      if (isNaN(qnt)) {
        program.error("quantity must be a number", { exitCode: 1 });
      }

      const payload = {
        quantity: qnt,
        chainId,
        manager,
        operator,
        managementFee,
        performanceFee,
      }

      const transactions = []
      for await (const tx of createVault(payload)) {
        transactions.push(tx);
      }

      console.table(transactions);
    }
  );
