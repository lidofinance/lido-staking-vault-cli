import { isAddress } from "viem";
import { program } from "@command";
import { getVaultFactoryContract } from "@contracts";
import { createVault } from "@features";
import {CreateVaultPayload, VaultWithDelegation} from "@types";

const vaultFactory = program.command("vf").description("vault factory contract");

vaultFactory
  .command("constants")
  .description("get vault factory constants info")
  .action(async () => {
    const { contract } = await getVaultFactoryContract();
    const beaconAddress = contract.read.BEACON();
    const delegationImplAddress = contract.read.DELEGATION_IMPL();

    console.table({
      beaconAddress,
      delegationImplAddress,
    });
  });

vaultFactory
  .command("create-vault")
  .description("create vault contract")
  .option("-a, --admin <admin>", "default admin address")
  .option("-c, --curator <curator>", "curator address")
  .option("-s, --mint-burn <minterBurner>", "minter-burner role address")
  .option("-f, --fund-withdraw <funderWithdrawer>", "funder-withdrawer role address")
  .option("-n, --no-manager <nodeOperatorManager>", "node operator manager address")
  .option("-o, --no-fee-claimer <nodeOperatorFeeClaimer>", "node operator fee claimer address")
  .option("-q, --quantity <quantity>", "quantity of vaults to create, default 1")
  .argument("<curatorFeeBP>", "Vault curator fee, for e.g. 100 == 1%")
  .argument("<nodeOperatorFeeBP>", "Node operator fee, for e.g. 100 == 1%")
  .action(
    async (
      curatorFeeBP: string,
      nodeOperatorFeeBP: string,
      options: CreateVaultPayload
    ) => {
      const {
        admin,
        curator,
        minterBurner,
        funderWithdrawer,
        nodeOperatorManager,
        nodeOperatorFeeClaimer,
        quantity = '1',
      } = options;
      let curatorFee = parseInt(curatorFeeBP);
      let nodeOperatorFee = parseInt(nodeOperatorFeeBP);
      const qnt = parseInt(quantity);

      if (isNaN(curatorFee) || curatorFee < 0) {
        program.error("curator fee must be a positive number", { exitCode: 1 });
      }

      if (isNaN(nodeOperatorFee) || nodeOperatorFee < 0) {
        program.error("operator fee must be a positive number", { exitCode: 1 });
      }

      if (!isAddress(admin)) {
        program.error("admin address is not valid", { exitCode: 1 });
      }

      if (!isAddress(curator)) {
        program.error("curator address is not valid", { exitCode: 1 });
      }

      if (!isAddress(minterBurner)) {
        program.error("minterBurner address is not valid", { exitCode: 1 });
      }

      if (!isAddress(funderWithdrawer)) {
        program.error("funder-withdrawer address is not valid", { exitCode: 1 });
      }

      if (!isAddress(nodeOperatorManager)) {
        program.error("node operator manager address is not valid", { exitCode: 1 });
      }

      if (!isAddress(nodeOperatorFeeClaimer)) {
        program.error("node operator fee claimer address is not valid", { exitCode: 1 });
      }

      if (isNaN(qnt)) {
        program.error("quantity must be a number", { exitCode: 1 });
      }

      const list: number[] = Array.from(Array(qnt));
      const payload = {
        defaultAdmin: admin,
        curator,
        minterBurner,
        funderWithdrawer,
        nodeOperatorManager,
        nodeOperatorFeeClaimer,
        curatorFeeBP: BigInt(curatorFee),
        nodeOperatorFeeBP: BigInt(nodeOperatorFee),
      } as VaultWithDelegation;

      const transactions = []

      try {
        for (const _ of list) {
          const tx = await createVault(payload);
          transactions.push(tx);
        }

        console.table(transactions);
      } catch (err) {
        if (err instanceof Error) {
          console.log('Create vault error:\n', err.message);
        }
      }
    }
  );



