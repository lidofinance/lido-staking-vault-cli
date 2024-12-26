import { Address } from "viem";
import { program } from "@command";
import { getVaultHubContract } from "@contracts";
import { getAccount } from "@providers";
import { getChain } from "@configs";

const vaultHub = program.command("vh").description("vault hub contract");

// constants - get vault hub constants
// v-count - get vaults count
// vi - get vault and vault socket by index
// va - get vault socket by address
// v-connect - connects a vault to the hub
// v-force-rebalance - force rebalance of the vault to have sufficient reserve ratio
// v-role-admin - returns the admin role that controls `role`
// v-role-member - returns one of the accounts that have `role`
// v-role-member-count - returns the number of accounts that have `role`
// v-role-has - returns `true` if `account` has been granted `role`

vaultHub
  .command("constants")
  .description("get vault hub constants")
  .action(async () => {
    const contract = getVaultHubContract();

    const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    // TODO: get stETH
    // const STETH = await contract.read.stETH();
    const address = contract.address;

    console.table({
      VAULT_MASTER_ROLE,
      DEFAULT_ADMIN_ROLE,
      // STETH,
      VaultHub: address,
    });
  });

vaultHub
  .command("v-count")
  .description("get vaults count")
  .action(async () => {
    const contract = getVaultHubContract();
    const vaultsCount = await contract.read.vaultsCount();

    console.table({
      "Vaults count": Number(vaultsCount),
    });
  });

vaultHub
  .command("vi")
  .description("get vault and vault socket by index")
  .argument("<index>", "index")
  .action(async (index: bigint) => {
    const contract = getVaultHubContract();
    const vault = await contract.read.vault([index]);
    const vaultSocket = await contract.read.vaultSocket([index]);

    console.table({
      Vault: vault,
      "Vault Socket": vaultSocket,
    });
  });

vaultHub
  .command("va")
  .description("get vault socket by address")
  .argument("<address>", "address")
  .action(async (address: Address) => {
    const contract = getVaultHubContract();
    const vaultSocket = await contract.read.vaultSocket([address]);

    console.table({ "Vault Socket": vaultSocket });
  });

vaultHub
  .command("v-connect")
  .description("connects a vault to the hub")
  .argument("<address>", "vault address")
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
      address: Address,
      shareLimit: bigint,
      reserveRatio: bigint,
      reserveRatioThreshold: bigint,
      treasuryFeeBP: bigint,
    ) => {
      const contract = getVaultHubContract();
      const tx = await contract.write.connectVault(
        [address, shareLimit, reserveRatio, reserveRatioThreshold, treasuryFeeBP],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    }
  );

vaultHub
  .command("v-force-rebalance")
  .description("force rebalance of the vault to have sufficient reserve ratio")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getVaultHubContract();
    const tx = await contract.write.forceRebalance([address], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({
      Transaction: tx,
    });
  });

// Roles
vaultHub
  .command("v-role-admin")
  .description("returns the admin role that controls `role`")
  .argument("<role>", "role")
  .action(async (role: readonly [Address]) => {
    const contract = getVaultHubContract();
    const roleAdmin = await contract.read.getRoleAdmin(role);

    console.table({
      "Role admin": roleAdmin,
    });
  });

vaultHub
  .command("v-role-member")
  .description("returns one of the accounts that have `role`")
  .argument("<role>", "role")
  .argument("<index>", "index")
  .action(async (role: Address, index: bigint) => {
    const contract = getVaultHubContract();
    const roleMember = await contract.read.getRoleMember([role, index]);

    console.table({
      "Role member": roleMember,
    });
  });

vaultHub
  .command("v-role-member-count")
  .description("returns the number of accounts that have `role`")
  .argument("<role>", "role")
  .argument("<index>", "index")
  .action(async (role: readonly [Address], index) => {
    const contract = getVaultHubContract();
    const roleMemberCount = await contract.read.getRoleMemberCount(role, index);

    console.table({
      "Role member count": roleMemberCount,
    });
  });

vaultHub
  .command("v-role-has")
  .description("returns `true` if `account` has been granted `role`")
  .argument("<role>", "role")
  .argument("<account>", "account")
  .action(async (role: Address, account: Address) => {
    const contract = getVaultHubContract();
    const roleHas = await contract.read.hasRole([role, account]);

    console.table({
      "Role has": roleHas,
    });
  });
