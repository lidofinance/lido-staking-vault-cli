import { isAddress, isAddressEqual } from "viem";
import { program } from "@command";
import { createVault } from "@features";
import { CreateVaultPayload } from "@types";

const vaultFactory = program.command("vf").description("vault factory contract");

vaultFactory
  .command("create-vault")
  .description("create vault contract")
  .option("-c, --curator <curator>", "curator address")
  .option("-o, --operator <operator>", "operator address")
  .option("-s, --staker <staker>", "staker address")
  .option("-t, --token-master <tokenMaster>", "token master address")
  .option("-d, --claim-operator-due <claimOperatorDue>", "operator due address")
  .option("-q, --quantity <quantity>", "quantity of vaults to create, default 1")
  .argument("<managerFee>", "Vault curator fee, for e.g. 100 == 1%")
  .argument("<performanceFee>", "Node operator fee, for e.g. 100 == 1%")
  .action(
    async (
      managerFee: string,
      performanceFee: string,
      options: CreateVaultPayload
    ) => {
      const { curator, operator, staker, tokenMaster, claimOperatorDue, quantity = '1' } = options;
      let curatorFee = parseInt(managerFee);
      let operatorFee = parseInt(performanceFee);
      const qnt = parseInt(quantity);

      if (isNaN(curatorFee) || curatorFee < 0) {
        program.error("curator fee must be a positive number", { exitCode: 1 });
      }

      if (isNaN(operatorFee) || operatorFee < 0) {
        program.error("operator fee must be a positive number", { exitCode: 1 });
      }

      if (!isAddress(curator)) {
        program.error("curator address is not valid", { exitCode: 1 });
      }

      if (!isAddress(operator)) {
        program.error("operator address is not valid", { exitCode: 1 });
      }

      if (!isAddress(staker)) {
        program.error("staker address is not valid", { exitCode: 1 });
      }

      if (!isAddress(tokenMaster)) {
        program.error("token master address is not valid", { exitCode: 1 });
      }

      if (!isAddress(claimOperatorDue)) {
        program.error("operator due address is not valid", { exitCode: 1 });
      }

      if (isAddressEqual(curator, operator)) {
        program.error("curator address can't be equal operator address", { exitCode: 1 });
      }

      if (isAddressEqual(tokenMaster, operator)) {
        program.error("token master address can't be equal operator address", { exitCode: 1 });
      }

      if (isAddressEqual(staker, operator)) {
        program.error("staker address can't be equal operator address", { exitCode: 1 });
      }

      if (isNaN(qnt)) {
        program.error("quantity must be a number", { exitCode: 1 });
      }

      const list = Array.from(Array(qnt));
      const payload = {
        curator,
        staker,
        tokenMaster,
        operator,
        claimOperatorDueRole: claimOperatorDue,
        curatorFee: BigInt(curatorFee),
        operatorFee: BigInt(operatorFee),
      }

      const transactions = []
      for (const _ of list) {
        const tx = await createVault(payload);
        transactions.push(tx);
      }

      console.table(transactions);
    }
  );



