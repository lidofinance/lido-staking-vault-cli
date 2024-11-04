import { program } from "@command";
import { getVaultHubContract } from "@contracts";
import { getAccount } from "@providers";

const vaultHub = program.command("vh").description("vault hub contract");

vaultHub
  .command("constants")
  .description("get vault hub constants")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async ({ chainId }) => {
    const contract = getVaultHubContract(chainId);

    const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const STETH = await contract.read.stETH();
    const TREASURY = await contract.read.treasury();
    const address = await contract.address;

    console.table({
      VAULT_MASTER_ROLE,
      DEFAULT_ADMIN_ROLE,
      STETH,
      TREASURY,
      VaultHub: address,
    });
  });

vaultHub
  .command("v-count")
  .description("get vaults count")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async ({ chainId }) => {
    const contract = getVaultHubContract(chainId);

    const vaultsCount = await contract.read.vaultsCount();

    console.table({
      "Vaults count": Number(vaultsCount),
    });
  });

vaultHub
  .command("v")
  .description("get vault")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<index>", "index")
  .action(async (index, { chainId }) => {
    const contract = getVaultHubContract(chainId);

    const vault = await contract.read.vault(index);
    const vaultSocket = await contract.read.vaultSocket(index);

    console.table({
      vault,
      vaultSocket,
    });
  });

vaultHub
  .command("v-connect")
  .description("connects a vault to the hub")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<vault>", "vault address")
  .argument(
    "<shareLimit>",
    "maximum number of stETH shares that can be minted by the vault"
  )
  .argument("<reserveRatio>", "minimum Reserve ratio in basis points")
  .argument(
    "<reserveRatioThreshold>",
    "reserve ratio that makes possible to force rebalance on the vault (in basis points)"
  )
  .argument("<treasuryFeeBP>", "treasury fee in basis points")
  .action(
    async (
      vault,
      shareLimit,
      reserveRatio,
      reserveRatioThreshold,
      treasuryFeeBP,
      { chainId }
    ) => {
      const contract = getVaultHubContract(chainId);

      const tx = await contract.write.connectVault(
        [vault, shareLimit, reserveRatio, reserveRatioThreshold, treasuryFeeBP],
        {
          account: getAccount(chainId),
          chain: chainId,
        }
      );

      console.table({
        Transaction: tx,
      });
    }
  );

vaultHub
  .command("v-force-rebalance")
  .description("force rebalance of the vault to have sufficient reserve ratio")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<vault>", "vault address")
  .action(async (vault, { chainId }) => {
    const contract = getVaultHubContract(chainId);

    const tx = await contract.write.forceRebalance([vault], {
      account: getAccount(chainId),
      chain: chainId,
    });

    console.table({
      Transaction: tx,
    });
  });

// Roles
vaultHub
  .command("v-role-admin")
  .description("returns the admin role that controls `role`")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<role>", "role")
  .action(async (role, { chainId }) => {
    const contract = getVaultHubContract(chainId);

    const roleAdmin = await contract.read.getRoleAdmin(role);

    console.table({
      "Role admin": roleAdmin,
    });
  });

vaultHub
  .command("v-role-member")
  .description("returns one of the accounts that have `role`")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<role>", "role")
  .argument("<index>", "index")
  .action(async (role, index, { chainId }) => {
    const contract = getVaultHubContract(chainId);

    const roleMember = await contract.read.getRoleMember(role, index);

    console.table({
      "Role member": roleMember,
    });
  });

vaultHub
  .command("v-role-member-count")
  .description("returns the number of accounts that have `role`")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<role>", "role")
  .argument("<index>", "index")
  .action(async (role, index, { chainId }) => {
    const contract = getVaultHubContract(chainId);

    const roleMemberCount = await contract.read.getRoleMemberCount(role, index);

    console.table({
      "Role member count": roleMemberCount,
    });
  });

vaultHub
  .command("v-role-has")
  .description("returns `true` if `account` has been granted `role`")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<role>", "role")
  .argument("<account>", "account")
  .action(async (role, account, { chainId }) => {
    const contract = getVaultHubContract(chainId);

    const roleHas = await contract.read.hasRole(role, account);

    console.table({
      "Role has": roleHas,
    });
  });
