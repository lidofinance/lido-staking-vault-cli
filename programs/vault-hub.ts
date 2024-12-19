import { Address } from "viem";
import { program } from "@command";
import { getVaultHubContract } from "@contracts";
import { getAccount } from "@providers";
import { ChainOption } from "@types";

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
  .option("-c, --chainId <chainId>", "chainId")
  .action(async ({ chainId }: ChainOption) => {
    const contract = getVaultHubContract(chainId);

    const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const STETH = await contract.read.stETH();
    const TREASURY = await contract.read.treasury();
    const address = contract.address;

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
  .action(async ({ chainId }: ChainOption) => {
    const contract = getVaultHubContract(chainId);

    const vaultsCount = await contract.read.vaultsCount();

    console.table({
      "Vaults count": Number(vaultsCount),
    });
  });

vaultHub
  .command("vi")
  .description("get vault and vault socket by index")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<index>", "index")
  .action(async (index: readonly [bigint], { chainId }: ChainOption) => {
    const contract = getVaultHubContract(chainId);

    const vault = await contract.read.vault(index);
    const vaultSocket = await contract.read.vaultSocket(index);

    console.table({
      Vault: vault,
      "Vault Socket": vaultSocket,
    });
  });

vaultHub
  .command("va")
  .description("get vault socket by address")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<address>", "address")
  .action(async (address: readonly [Address], { chainId }: ChainOption) => {
    const contract = getVaultHubContract(chainId);

    const vaultSocket = await contract.read.vaultSocket(address);

    console.table({ "Vault Socket": vaultSocket });
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
      vault: Address,
      shareLimit: bigint,
      reserveRatio: bigint,
      reserveRatioThreshold: bigint,
      treasuryFeeBP: bigint,
      { chainId }: ChainOption
    ) => {
      const contract = getVaultHubContract(chainId);

      const tx = await contract.write.connectVault(
        [vault, shareLimit, reserveRatio, reserveRatioThreshold, treasuryFeeBP],
        {
          account: getAccount(chainId),
          chain: chainId,
        }
      );

      console.table({ Transaction: tx });
    }
  );

vaultHub
  .command("v-force-rebalance")
  .description("force rebalance of the vault to have sufficient reserve ratio")
  .option("-c, --chainId <chainId>", "chainId")
  .argument("<vault>", "vault address")
  .action(async (vault: Address, { chainId }: ChainOption) => {
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
  .action(async (role: readonly [Address], { chainId }: ChainOption) => {
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
  .action(async (
    role: readonly [Address, bigint],
    index,
    { chainId }: ChainOption
  ) => {
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
  .action(async (role: readonly [Address], index, { chainId }: ChainOption) => {
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
  .action(async (role: readonly [Address, Address], account, { chainId }: ChainOption) => {
    const contract = getVaultHubContract(chainId);

    const roleHas = await contract.read.hasRole(role, account);

    console.table({
      "Role has": roleHas,
    });
  });
