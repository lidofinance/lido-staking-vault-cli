import { program } from "@command";
import { getVaultFactoryContract } from "@contracts";
import { createVault } from "@features";
import { CreateVaultPayload, VaultWithDelegation } from "@types";
import {validateAddressMap} from "@utils";

const vaultFactory = program.command("factory").description("vault factory contract");

vaultFactory
  .command("constants")
  .description("get vault factory constants info")
  .action(async () => {
    const { contract } = getVaultFactoryContract();
    try {
      const beaconAddress = await contract.read.BEACON();
      const delegationImplAddress = await contract.read.DELEGATION_IMPL();

      console.table({
        beaconAddress,
        delegationImplAddress,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting constants:\n', err.message);
      }
    }
  });

vaultFactory
  .command("create-vault")
  .description("create vault contract")
  .option("-a, --defaultAdmin <defaultAdmin>", "default admin address")
  .option("-f, --funder <funder>", "funder role address")
  .option("-w, --withdrawer <withdrawer>", "withdrawer role address")
  .option("-m, --minter <minter>", "minter role address")
  .option("-b, --burner <burner>", "burner role address")
  .option("-r, --rebalancer <rebalancer>", "rebalancer role address")
  .option("-p, --depositPauser <depositPauser>", "depositPauser role address")
  .option("-d, --depositResumer <depositResumer>", "depositResumer role address")
  .option("-e, --exitRequester <exitRequester>", "exitRequester role address")
  .option("-u, --disconnecter <disconnecter>", "disconnecter role address")
  .option("-c, --curator <curator>", "curator address")
  .option("-n, --nodeOperatorManager <nodeOperatorManager>", "node operator manager address")
  .option("-o, --nodeOperatorFeeClaimer <nodeOperatorFeeClaimer>", "node operator fee claimer address")
  .argument("<curatorFeeBP>", "Vault curator fee, for e.g. 100 == 1%")
  .argument("<nodeOperatorFeeBP>", "Node operator fee, for e.g. 100 == 1%")
  .argument("[quantity]", "quantity of vaults to create, default 1", "1")
  .action(
    async (
      curatorFeeBP: string,
      nodeOperatorFeeBP: string,
      quantity: string,
      options: CreateVaultPayload
    ) => {
      let curatorFee = parseInt(curatorFeeBP);
      let nodeOperatorFee = parseInt(nodeOperatorFeeBP);
      const qnt = parseInt(quantity);

      if (isNaN(curatorFee) || curatorFee < 0) {
        program.error("curator fee must be a positive number", { exitCode: 1 });
      }

      if (isNaN(nodeOperatorFee) || nodeOperatorFee < 0) {
        program.error("operator fee must be a positive number", { exitCode: 1 });
      }

      if (isNaN(qnt)) {
        program.error("quantity must be a number", { exitCode: 1 });
      }

      const errorsList = validateAddressMap(options);
      if (errorsList.length > 0) {
        errorsList.forEach((error) => program.error(error));
        return;
      }

      const list: number[] = Array.from(Array(qnt));
      const payload = {
        ...options,
        curatorFeeBP: curatorFee,
        nodeOperatorFeeBP: nodeOperatorFee,
      } as VaultWithDelegation;

      const transactions = [];

      try {
        for (const _ of list) {
          const tx = await createVault(payload);
          transactions.push(tx);
        }

        console.table(transactions);
      } catch (err) {
        if (err instanceof Error) {
          program.error(err.message);
        }
      }
    }
  );


