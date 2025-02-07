import { program } from "@command";
import { getDashboardContract } from "@contracts";
import { Address } from "viem";
import { Permit, RoleAssignment } from "@types";
import { callWriteMethod, callReadMethod } from "@utils";
import { getBaseInfo } from "@features";

const dashboard = program
  .command("dashboard")
  .description("dashboard contract");

dashboard
  .command("info")
  .description("get dashboard base info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await getBaseInfo(contract);
  });

dashboard
  .command("committee")
  .description("voting committee info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "votingCommittee");
  });

dashboard
  .command("vault")
  .description("vault info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "vaultSocket");
  });

dashboard
  .command("s-limit")
  .description("shares limit")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "shareLimit");
  });

dashboard
  .command("s-minted")
  .description("shares minted")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "sharesMinted");
  });

dashboard
  .command("reserve-ratio")
  .description("vault reserve ratio of the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "reserveRatioBP");
  });

dashboard
  .command("t-reserve-ratio")
  .description("threshold reserve ratio of the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "thresholdReserveRatioBP");
  });

dashboard
  .command("t-fee")
  .description("treasury fee basis points")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "treasuryFee");
  });

dashboard
  .command("valuation")
  .description("valuation of the vault in ether")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "valuation");
  });

dashboard
  .command("t-shares")
  .description("total of shares that can be minted on the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "totalMintableShares");
  });

dashboard
  .command("get-shares")
  .description(
    "maximum number of shares that can be minted with deposited ether"
  )
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to be funded")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "projectedNewMintableShares", [
      BigInt(ether),
    ]);
  });

dashboard
  .command("withdrawable-eth")
  .description("amount of ether that can be withdrawn from the staking vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callReadMethod(contract, "withdrawableEther");
  });

// TODO: test without voting
dashboard
  .command("ownership")
  .description("transfers ownership of the staking vault to a new owner")
  .argument("<address>", "dashboard address")
  .argument("<newOwner>", "address of the new owner")
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "transferStakingVaultOwnership", [
      newOwner,
    ]);
  });

dashboard
  .command("disconnect")
  .description("disconnects the staking vault from the vault hub")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "voluntaryDisconnect", []);
  });

dashboard
  .command("fund")
  .description("funds the staking vault with ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to be funded")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "fund", [], BigInt(ether));
  });

dashboard
  .command("fund-weth")
  .description("funds the staking vault with wrapped ether")
  .argument("<address>", "dashboard address")
  .argument("<wethAmount>", "amount of weth to be funded")
  .action(async (address: Address, wethAmount: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "fundWeth", [BigInt(wethAmount)]);
  });

dashboard
  .command("withdraw")
  .description("withdraws ether from the staking vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<ether>", "amount of ether to withdraw")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "withdraw", [recipient, BigInt(ether)]);
  });

dashboard
  .command("withdraw-weth")
  .description("withdraws stETH tokens from the staking vault to wrapped ether")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<ether>", "amount of ether to withdraw")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "withdrawWETH", [recipient, BigInt(ether)]);
  });

dashboard
  .command("exit")
  .description("requests the exit of a validator from the staking vault")
  .argument("<address>", "dashboard address")
  .argument("<validatorPubKey>", "public key of the validator to exit")
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "requestValidatorExit", [validatorPubKey]);
  });

dashboard
  .command("mint-shares")
  .description("mints stETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDashboardContract(address);

      await callWriteMethod(contract, "mintShares", [
        recipient,
        BigInt(amountOfShares),
      ]);
    }
  );

dashboard
  .command("mint-steth")
  .description("mints stETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDashboardContract(address);

      await callWriteMethod(contract, "mintStETH", [
        recipient,
        BigInt(amountOfShares),
      ]);
    }
  );

dashboard
  .command("mint-wsteth")
  .description("mints wstETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<tokens>", "amount of tokens to mint")
  .action(async (address: Address, recipient: Address, tokens: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "mintWstETH", [recipient, BigInt(tokens)]);
  });

dashboard
  .command("burn-shares")
  .description(
    "Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract"
  )
  .argument("<address>", "dashboard address")
  .argument("<amountOfShares>", "amount of shares to burn")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "burnShares", [BigInt(amountOfShares)]);
  });

dashboard
  .command("burn-steth")
  .description(
    "Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract."
  )
  .argument("<address>", "dashboard address")
  .argument("<amountOfShares>", "amount of shares to burn")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "burnStETH", [BigInt(amountOfShares)]);
  });

dashboard
  .command("burn-wsteth")
  .description("burn wstETH tokens from the sender backed by the vault")
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of wstETH tokens to burn")
  .action(async (address: Address, tokens: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "burnWstETH", [BigInt(tokens)]);
  });

dashboard
  .command("burn-shares-permit")
  .description(
    "Burns stETH tokens (in shares) backed by the vault from the sender using permit (with value in stETH)."
  )
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of stETH tokens to burn")
  .argument(
    "<permitJSON>",
    "JSON data required for the stETH.permit() method to set the allowance"
  )
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "burnSharesWithPermit", [
      BigInt(tokens),
      permit,
    ]);
  });

dashboard
  .command("burn-steth-permit")
  .description(
    "Burns stETH tokens backed by the vault from the sender using permit."
  )
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of stETH tokens to burn")
  .argument(
    "<permitJSON>",
    "JSON data required for the stETH.permit() method to set the allowance"
  )
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "burnStETHWithPermit", [
      BigInt(tokens),
      permit,
    ]);
  });

dashboard
  .command("burn-wsteth-permit")
  .description(
    "burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit"
  )
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of wstETH tokens to burn")
  .argument(
    "<permitJSON>",
    "JSON data required for the wstETH.permit() method to set the allowance"
  )
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "burnWstETHWithPermit", [
      BigInt(tokens),
      permit,
    ]);
  });

dashboard
  .command("rebalance")
  .description("rebalance the vault by transferring ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to rebalance")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "rebalanceVault", [BigInt(ether)]);
  });

dashboard
  .command("recover-erc20")
  .description(
    "recovers ERC20 tokens or ether from the dashboard contract to sender"
  )
  .argument("<address>", "dashboard address")
  .argument(
    "<token>",
    "Address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether"
  )
  .argument("<recipient>", "Address of the recovery recipient")
  .argument("<amount>", "amount of ether to recover")
  .action(
    async (
      address: Address,
      token: Address,
      recipient: Address,
      amount: string
    ) => {
      const contract = getDashboardContract(address);

      await callWriteMethod(contract, "recoverERC20", [
        token,
        recipient,
        BigInt(amount),
      ]);
    }
  );

dashboard
  .command("recover-erc721")
  .description(
    "Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)"
  )
  .argument("<address>", "dashboard address")
  .argument("<token>", "an ERC721-compatible token")
  .argument("<tokenId>", "token id to recover")
  .argument("<recipient>", "Address of the recovery recipient")
  .action(
    async (
      address: Address,
      token: Address,
      tokenId: string,
      recipient: Address
    ) => {
      const contract = getDashboardContract(address);

      await callWriteMethod(contract, "recoverERC721", [
        token,
        BigInt(tokenId),
        recipient,
      ]);
    }
  );

dashboard
  .command("deposit-pause")
  .description("Pauses beacon chain deposits on the staking vault.")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "pauseBeaconChainDeposits", []);
  });

dashboard
  .command("deposit-resume")
  .description("Mass-grants multiple roles to multiple accounts.")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethod(contract, "resumeBeaconChainDeposits", []);
  });

dashboard
  .command("role-grant")
  .description("Mass-revokes multiple roles from multiple accounts.")
  .argument("<address>", "dashboard address")
  .argument("<roleAssignmentJSON>", "JSON array of role assignments")
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDashboardContract(address);
    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];
    if (!Array.isArray(payload)) {
      throw new Error(
        "the 2nd argument should be an array of role assignments"
      );
    }

    await callWriteMethod(contract, "grantRoles", [payload]);
  });

dashboard
  .command("role-revoke")
  .description("Resumes beacon chain deposits on the staking vault.")
  .argument("<address>", "dashboard address")
  .argument("<roleAssignmentJSON>", "JSON array of role assignments")
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDashboardContract(address);
    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];
    if (!Array.isArray(payload)) {
      throw new Error(
        "the 2nd argument should be an array of role assignments"
      );
    }

    await callWriteMethod(contract, "revokeRoles", [payload]);
  });
