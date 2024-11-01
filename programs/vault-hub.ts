import { program } from "@command";
import { getVaultHubContract } from "@contracts";
import { getAccount } from "@providers";
import { Address } from "viem";

const vaultHub = program.command("vh").description("vault hub contract");

vaultHub
  .command("constants")
  .description("get vault hub constants")
  .option("--chainId", "chainId")
  .action(async ({ chainId }) => {
    const contract = getVaultHubContract(chainId);

    const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const STETH = await contract.read.STETH();

    console.table({
      VAULT_MASTER_ROLE,
      DEFAULT_ADMIN_ROLE,
      STETH,
    });
  });

vaultHub
  .command("v-count")
  .description("get vaults count")
  .argument("<chainId>", "chainId")
  .action(async (chainId) => {
    const contract = getVaultHubContract(chainId);

    const vaultsCount = await contract.read.vaultsCount();

    console.log("Vaults count:", Number(vaultsCount));
  });

vaultHub
  .command("v")
  .description("get vault")
  .argument("<chainId>", "chainId")
  .argument("<index>", "index")
  .action(async (chainId, index) => {
    const contract = getVaultHubContract(chainId);

    const vault = await contract.read.vault(index);
    const vaultSocket = await contract.read.vaultSocket(index);

    console.table({
      vault,
      vaultSocket,
    });
  });

vaultHub
  .command("rr-index")
  .description("get reserve ratio by index")
  .argument("<chainId>", "chainId")
  .argument("<index>", "index")
  .action(async (chainId, index) => {
    const contract = getVaultHubContract(chainId);

    const vault = await contract.read.vault(index);
    const reserveRatio = await contract.read.reserveRatio([vault]);

    console.log("Reserve ratio:", Number(reserveRatio));
  });

vaultHub
  .command("rr-vault")
  .description("get reserve ratio by vault")
  .argument("<chainId>", "chainId")
  .argument("<vault>", "vault")
  .action(async (chainId, vault) => {
    const contract = getVaultHubContract(chainId);

    const reserveRatio = await contract.read.reserveRatio([vault]);

    console.log("Reserve ratio:", Number(reserveRatio));
  });

vaultHub
  .command("v-connect")
  .description("connect vault")
  .argument("<chainId>", "chainId")
  .argument("<vault>", "vault")
  .argument("<capShares>", "cap shares")
  .argument("<minReserveRatioBP>", "min reserve ratio bp")
  .argument("<treasuryFeeBP>", "treasury fee bp")
  .action(
    async (chainId, vault, capShares, minReserveRatioBP, treasuryFeeBP) => {
      const contract = getVaultHubContract(chainId);

      const tx = await contract.write.connectVault(
        [vault, capShares, minReserveRatioBP, treasuryFeeBP],
        {
          account: getAccount(chainId),
        }
      );

      console.log("Transaction:", tx);
    }
  );

vaultHub
  .command("v-mint-steth") // Define the 'v-mint-steth' command
  .description(
    "mint StETH tokens backed by vault external balance to the receiver address"
  ) // Description of the command
  .argument("<chainId>", "chainId") // Argument: chain ID
  .argument("<receiver>", "receiver") // Argument: receiver address
  .argument("<amount>", "amount") // Argument: amount to mint
  .action(async (chainId, receiver: Address, amount) => {
    // Get the VaultHub contract instance for the specified chain ID
    const contract = getVaultHubContract(chainId);

    // Execute the mintStethBackedByVault transaction with receiver and amount
    const tx = await contract.write.mintStethBackedByVault([receiver, amount], {
      account: getAccount(chainId),
    });

    // Log the transaction details to the console
    console.log("Transaction:", tx);
  });

vaultHub
  .command("v-burn-steth")
  .description("burn steth from the balance of the vault contract")
  .argument("<chainId>", "chainId")
  .argument("<amount>", "amount")
  .action(async (chainId, amount) => {
    const contract = getVaultHubContract(chainId);

    const tx = await contract.write.burnStethBackedByVault([amount], {
      account: getAccount(chainId),
    });

    console.log("Transaction:", tx);
  });

vaultHub
  .command("v-force-balance")
  .description("force rebalance of the vault")
  .argument("<chainId>", "chainId")
  .argument("<vault>", "vault")
  .action(async (chainId, vault) => {
    const contract = getVaultHubContract(chainId);

    const tx = await contract.write.forceRebalance([vault], {
      account: getAccount(chainId),
    });

    console.log("Transaction:", tx);
  });

vaultHub
  .command("v-rebalance")
  .description(
    "rebalances the vault, by writing off the amount equal to passed ether from the vault's minted stETH counter"
  )
  .argument("<chainId>", "chainId")
  .action(async (chainId) => {
    const contract = getVaultHubContract(chainId);

    const tx = await contract.write.rebalance({
      account: getAccount(chainId),
    });

    console.log("Transaction:", tx);
  });
