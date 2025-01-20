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

// ? - connect Vaults to VaultHub through protocol voting

// Works fine
vaultHub
  .command("constants")
  .description("get vault hub constants")
  .action(async () => {
    const contract = await getVaultHubContract();

    // TODO: get info why I can't call these fn's
    // const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
    // const VAULT_REGISTRY_ROLE = await contract.read.VAULT_REGISTRY_ROLE();
    // const STETH = await contract.read.STETH();

    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const address = contract.address;

    console.table({
      // VAULT_MASTER_ROLE,
      DEFAULT_ADMIN_ROLE,
      // VAULT_REGISTRY_ROLE,
      // STETH,
      VaultHub: address,
    });
  });

// Works fine
vaultHub
  .command("v-count")
  .description("get connected vaults number")
  .action(async () => {
    const contract = await getVaultHubContract();
    const vaultsCount = await contract.read.vaultsCount();

    console.table({
      "Vaults count": Number(vaultsCount),
    });
  });

// TODO: investigate how to pass right index
// index === 0 PositionOutOfBoundsError: Position `223` is out of bounds (`0 < position < 192`)
vaultHub
  .command("vi")
  .description("get vault and vault socket by index")
  .argument("<index>", "index")
  .action(async (index: string) => {
    const biIndex = BigInt(index);
    const contract = await getVaultHubContract();
    const vault = await contract.read.vault([biIndex]);
    const vaultSocket = await contract.read.vaultSocket([biIndex]);

    console.table({
      Vault: vault,
      "Vault Socket": vaultSocket,
    });
  });

// TODO: check when vault will be connected
vaultHub
  .command("va")
  .description("get vault socket by address")
  .argument("<address>", "address")
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    const vaultSocket = await contract.read.vaultSocket([address]);

    console.table({ "Vault Socket": vaultSocket });
  });

// TODO: need access to account with access to accounting
vaultHub
  .command("v-connect")
  .description("connects a vault to the hub (vault master role needed)")
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
      const contract = await getVaultHubContract();
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

// TODO: test on connected vault
vaultHub
  .command("v-force-rebalance")
  .description("force rebalance of the vault to have sufficient reserve ratio")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    const tx = await contract.write.forceRebalance([address], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({
      Transaction: tx,
    });
  });

// Roles
// Works
vaultHub
  .command("v-role-admin")
  .description("returns the admin role that controls `role`")
  .argument("<role>", "role")
  .action(async (role: Address) => {
    const contract = await getVaultHubContract();
    const roleAdmin = await contract.read.getRoleAdmin([role]);

    console.table({
      "Role admin": roleAdmin,
    });
  });

// Works
vaultHub
  .command("v-role-member")
  .description("returns one of the accounts that have `role`")
  .argument("<role>", "role")
  .argument("<index>", "index")
  .action(async (role: Address, index: bigint) => {
    const contract = await getVaultHubContract();
    const roleMember = await contract.read.getRoleMember([role, index]);

    console.table({
      "Role member": roleMember,
    });
  });

// Works
vaultHub
  .command("v-role-member-count")
  .description("returns the number of accounts that have `role`")
  .argument("<role>", "role")
  .action(async (role: Address) => {
    const contract = await getVaultHubContract();
    const roleMemberCount = await contract.read.getRoleMemberCount([role]);

    console.table({
      "Role member count": roleMemberCount,
    });
  });

// Works
vaultHub
  .command("v-role-has")
  .description("returns `true` if `account` has been granted `role`")
  .argument("<role>", "role")
  .argument("<account>", "account")
  .action(async (role: Address, account: Address) => {
    const contract = await getVaultHubContract();
    const roleHas = await contract.read.hasRole([role, account]);

    console.table({
      "Role has": roleHas,
    });
  });
