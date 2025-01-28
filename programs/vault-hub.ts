import { Address } from "viem";
import { program } from "@command";
import { getVaultHubContract } from "@contracts";
import { getAccount } from "@providers";
import { getChain } from "@configs";

const vaultHub = program.command("vh").description("vault hub contract");

// Works fine
vaultHub
  .command("constants")
  .description("get vault hub constants")
  .action(async () => {
    const contract = await getVaultHubContract();

    try {
      const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
      const VAULT_REGISTRY_ROLE = await contract.read.VAULT_REGISTRY_ROLE();
      const STETH = await contract.read.STETH();
      const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
      const CONTRACT_ADDRESS = contract.address;

      const payload = {
        VAULT_MASTER_ROLE,
        DEFAULT_ADMIN_ROLE,
        VAULT_REGISTRY_ROLE,
        STETH,
        CONTRACT_ADDRESS,
      }

      console.table(Object.entries(payload));
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting info:\n', err.message);
      }
    }
  });

vaultHub
  .command("add-codehash")
  .description("get vault hub constants")
  .argument("<codehash>", "get vault hub constants")
  .action(async (codehash: Address) => {
    const contract = await getVaultHubContract();

    try {
      const tx = contract.write.addVaultProxyCodehash([codehash], {
        account: getAccount(),
        chain: getChain(),
      })

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error while adding codehash:\n', err.message);
      }
    }
  });

// Works fine
vaultHub
  .command("v-count")
  .description("get connected vaults number")
  .action(async () => {
    const contract = await getVaultHubContract();

    try {
      const vaultsCount = await contract.read.vaultsCount();

      console.table({
        "Vaults count": Number(vaultsCount),
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting vaults count:\n', err.message);
      }
    }
  });

vaultHub
  .command("vi")
  .description("get vault and vault socket by index")
  .argument("<index>", "index")
  .action(async (index: string) => {
    const biIndex = BigInt(index);
    const contract = await getVaultHubContract();

    try {
      const vault = await contract.read.vault([biIndex]);
      const vaultSocket = await contract.read.vaultSocket([biIndex]);

      console.table({
        Vault: vault,
        "Vault Socket": vaultSocket,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting vault:\n', err.message);
      }
    }
  });

// TODO: check when vault will be connected
vaultHub
  .command("va")
  .description("get vault socket by address")
  .argument("<address>", "address")
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    try {
      const vaultSocket = await contract.read.vaultSocket([address]);

      console.table({ "Vault Socket": vaultSocket });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting vault:\n', err.message);
      }
    }
  });

// TODO: replace by voting
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
      try {
        const contract = await getVaultHubContract();
        const account = getAccount();

        const tx = await contract.write.connectVault(
          [address, shareLimit, reserveRatio, reserveRatioThreshold, treasuryFeeBP],
          {
            account,
            chain: getChain(),
          }
        );

        console.table({ Transaction: tx });
      } catch (err) {
        if (err instanceof Error) {
          program.error(err.message);
        }
      }
    }
  );

vaultHub
  .command("v-update-share-limit")
  .description("updates share limit for the vault")
  .argument("<address>", "vault address")
  .argument("<shareLimit>", "vault address")
  .action(async (address: Address, shareLimit: string) => {
    try {
      const contract = await getVaultHubContract();
      const tx = await contract.write.updateShareLimit([address, BigInt(shareLimit)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vaultHub
  .command("v-disconnect")
  .description("force disconnects a vault from the hub")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    try {
      const contract = await getVaultHubContract();
      const tx = await contract.write.disconnect([address], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vaultHub
  .command("v-owner-disconnect")
  .description("disconnects a vault from the hub, msg.sender should be vault's owner")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    try {
      const contract = await getVaultHubContract();
      const tx = await contract.write.voluntaryDisconnect([address], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vaultHub
  .command("v-bbv-mint")
  .description(" mint StETH shares backed by vault external balance to the receiver address")
  .argument("<address>", "vault address")
  .argument("<recipient>", "address of the receiver")
  .argument("<amountOfShares>", "amount of stETH shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    try {
      const contract = await getVaultHubContract();
      const tx = await contract.write.mintSharesBackedByVault(
        [address, recipient, BigInt(amountOfShares)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vaultHub
  .command("v-bbv-burn")
  .description("burn steth shares from the balance of the VaultHub contract")
  .argument("<address>", "vault address")
  .argument("<amountOfShares>", "amount of stETH shares to mint")
  .action(async (address: Address, amountOfShares: string) => {
    try {
      const contract = await getVaultHubContract();
      const tx = await contract.write.burnSharesBackedByVault(
        [address, BigInt(amountOfShares)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vaultHub
  .command("v-bbv-transfer")
  .description("separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH")
  .argument("<address>", "vault address")
  .argument("<amountOfShares>", "amount of stETH shares to mint")
  .action(async (address: Address, amountOfShares: string) => {
    try {
      const contract = await getVaultHubContract();
      const tx = await contract.write.transferAndBurnSharesBackedByVault(
        [address, BigInt(amountOfShares)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vaultHub
  .command("v-force-rebalance")
  .description("force rebalance of the vault to have sufficient reserve ratio")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    try {
      const contract = await getVaultHubContract();
      const tx = await contract.write.forceRebalance([address], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({
        Transaction: tx,
      });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vaultHub
  .command("v-role-admin")
  .description("returns the admin role that controls `role`")
  .argument("<role>", "role")
  .action(async (role: Address) => {
    try {
      const contract = await getVaultHubContract();
      const roleAdmin = await contract.read.getRoleAdmin([role]);

      console.table({
        "Role admin": roleAdmin,
      });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vaultHub
  .command("v-role-member")
  .description("returns one of the accounts that have `role`")
  .argument("<role>", "role")
  .argument("<index>", "index")
  .action(async (role: Address, index: bigint) => {
    try {
      const contract = await getVaultHubContract();
      const roleMember = await contract.read.getRoleMember([role, index]);

      console.table({
        "Role member": roleMember,
      });
    }  catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vaultHub
  .command("v-role-member-count")
  .description("returns the number of accounts that have `role`")
  .argument("<role>", "role")
  .action(async (role: Address) => {
    try {
      const contract = await getVaultHubContract();
      const roleMemberCount = await contract.read.getRoleMemberCount([role]);

      console.table({
        "Role member count": roleMemberCount,
      });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vaultHub
  .command("v-role-has")
  .description("returns `true` if `account` has been granted `role`")
  .argument("<role>", "role")
  .argument("<account>", "account")
  .action(async (role: Address, account: Address) => {
    try {
      const contract = await getVaultHubContract();
      const roleHas = await contract.read.hasRole([role, account]);

      console.table({
        "Role has": roleHas,
      });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });
