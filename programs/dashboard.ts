import { program } from "@command";
import { getDashboardContract } from "@contracts";
import { Address } from "viem";
import { getAccount } from "@providers";
import { getChain } from "@configs";
import { Permit, RoleAssignment } from "@types";

const dashboard = program.command("dashboard").description("dashboard contract");

dashboard
  .command("info")
  .description("get dashboard base info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    try {
      const steth = await contract.read.STETH();
      const wsteth = await contract.read.WSTETH();
      const weth = await contract.read.WETH();
      const isInit = await contract.read.initialized();
      const vault = await contract.read.stakingVault();

      const payload = {
        steth,
        wsteth,
        weth,
        vault,
        isInit,
      }

      console.table(Object.entries(payload));
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting info:\n', err.message);
      }
    }
  });

dashboard
  .command("committee")
  .description("voting committee info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    try {
      const contract = getDashboardContract(address);
      const votingCommittee = await contract.read.votingCommittee();

      console.table(votingCommittee);
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting voting committee info:\n', err.message);
      }
    }
  });

dashboard
  .command("vault")
  .description("vault info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    try {
      const contract = getDashboardContract(address);
      const vaultInfo = await contract.read.vaultSocket();

      console.table(Object.values(vaultInfo));
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting vault info:\n', err.message);
      }
    }
  });

dashboard
  .command("s-limit")
  .description("shares limit")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    try {
      const shareLimit = await contract.read.shareLimit();
      console.table({ 'Share limit': shareLimit });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting share limit:\n', err.message);
      }
    }
  });

dashboard
  .command("s-minted")
  .description("shares minted")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    try {
      const sharesMinted = await contract.read.sharesMinted();
      console.table({ 'Share minted': sharesMinted });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting shares minted:\n', err.message);
      }
    }
  });

dashboard
  .command("reserve-ratio")
  .description("vault reserve ratio of the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    try {
      const reserveRatio = await contract.read.reserveRatioBP();
      console.table({ 'Reserve ratio BP': reserveRatio });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting reserve ratio:\n', err.message);
      }
    }
  });

dashboard
  .command("t-reserve-ratio")
  .description("threshold reserve ratio of the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    try {
      const thresholdReserveRatio = await contract.read.thresholdReserveRatioBP();
      console.table({ 'Threshold reserve ratio BP': thresholdReserveRatio });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting threshold reserve ratio:\n', err.message);
      }
    }
  });

dashboard
  .command("t-fee")
  .description("treasury fee basis points")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    try {
      const treasuryFee = await contract.read.treasuryFee();
      console.table({ 'Treasury fee': treasuryFee });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting treasury fee:\n', err.message);
      }
    }
  });

dashboard
  .command("valuation")
  .description("valuation of the vault in ether")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    try {
      const valuation = await contract.read.valuation();
      console.table({ Valuation: valuation });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting valuation of the vault in ether:\n', err.message);
      }
    }
  });

dashboard
  .command("t-shares")
  .description("total of shares that can be minted on the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    try {
      const totalMintableShares = await contract.read.totalMintableShares();
      console.table({ 'Total mintable shares': totalMintableShares });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting total of shares that can be minted on the vault:\n', err.message);
      }
    }
  });

dashboard
  .command("get-shares")
  .description("maximum number of shares that can be minted with deposited ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to be funded")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);

    try {
      const mintableShares = await contract.read.projectedNewMintableShares([BigInt(ether)]);
      console.table({ 'Mintable shares': mintableShares });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting maximum number of shares that can be minted with deposited ether:\n', err.message);
      }
    }
  });

dashboard
  .command("withdrawable-eth")
  .description("amount of ether that can be withdrawn from the staking vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    try {
      const withdrawableEther = await contract.read.withdrawableEther();
      console.table({ 'Withdrawable ether': withdrawableEther });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting amount of ether that can be withdrawn from the staking vault:\n', err.message);
      }
    }
  });

// TODO: test without voting
dashboard
  .command("ownership")
  .description("transfers ownership of the staking vault to a new owner")
  .argument("<address>", "dashboard address")
  .argument("<newOwner>", "address of the new owner")
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.transferStakingVaultOwnership(
        [newOwner],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when transferring ownership of the staking vault to a new owner:\n', err.message);
      }
    }
  });

dashboard
  .command("disconnect")
  .description("disconnects the staking vault from the vault hub")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    try {
      const tx = await contract.write.voluntaryDisconnect({
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when disconnecting the staking vault from the vault hub:\n', err.message);
      }
    }
  });

dashboard
  .command("fund")
  .description("funds the staking vault with ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to be funded")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.fund({
        account: getAccount(),
        chain: getChain(),
        value: BigInt(ether),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when funding:\n', err.message);
      }
    }
  });

dashboard
  .command("fund-weth")
  .description("funds the staking vault with wrapped ether")
  .argument("<address>", "dashboard address")
  .argument("<wethAmount>", "amount of weth to be funded")
  .action(async (address: Address, wethAmount: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.fundWeth([BigInt(wethAmount)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when funding weth:\n', err.message);
      }
    }
  });

dashboard
  .command("withdraw")
  .description("withdraws ether from the staking vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<ether>", "amount of ether to withdraw")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.withdraw([recipient, BigInt(ether)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when withdrawing:\n', err.message);
      }
    }
  });

dashboard
  .command("withdraw-weth")
  .description("withdraws stETH tokens from the staking vault to wrapped ether")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<ether>", "amount of ether to withdraw")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.withdrawWETH([recipient, BigInt(ether)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when withdrawing weth:\n', err.message);
      }
    }
  });

dashboard
  .command("exit")
  .description("requests the exit of a validator from the staking vault")
  .argument("<address>", "dashboard address")
  .argument("<validatorPubKey>", "public key of the validator to exit")
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDashboardContract(address);
    try {
      const tx = await contract.write.requestValidatorExit([validatorPubKey], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when requesting the exit of a validator from the staking vault:\n', err.message);
      }
    }
  });

dashboard
  .command("mint-shares")
  .description("mints stETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.mintShares([recipient, BigInt(amountOfShares)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when minting shares:\n', err.message);
      }
    }
  });

dashboard
  .command("mint-steth")
  .description("mints stETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.mintStETH([recipient, BigInt(amountOfShares)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when minting stETH:\n', err.message);
      }
    }
  });

dashboard
  .command("mint-wsteth")
  .description("mints wstETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<tokens>", "amount of tokens to mint")
  .action(async (address: Address, recipient: Address, tokens: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.mintWstETH([recipient, BigInt(tokens)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when minting wstETH:\n', err.message);
      }
    }
  });

dashboard
  .command("burn-shares")
  .description("Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract")
  .argument("<address>", "dashboard address")
  .argument("<amountOfShares>", "amount of shares to burn")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.burnShares([BigInt(amountOfShares)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when burning shares:\n', err.message);
      }
    }
  });

dashboard
  .command("burn-steth")
  .description("Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.")
  .argument("<address>", "dashboard address")
  .argument("<amountOfShares>", "amount of shares to burn")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.burnStETH([BigInt(amountOfShares)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when burning stETH:\n', err.message);
      }
    }
  });

dashboard
  .command("burn-wsteth")
  .description("burn wstETH tokens from the sender backed by the vault")
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of wstETH tokens to burn")
  .action(async (address: Address, tokens: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.burnWstETH([BigInt(tokens)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when burning wstETH:\n', err.message);
      }
    }
  });

dashboard
  .command("burn-shares-permit")
  .description("Burns stETH tokens (in shares) backed by the vault from the sender using permit (with value in stETH).")
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of stETH tokens to burn")
  .argument("<permitJSON>", "JSON data required for the stETH.permit() method to set the allowance")
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.burnSharesWithPermit([BigInt(tokens), permit], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when burning stETH (in shares) using permit:\n', err.message);
      }
    }
  });

dashboard
  .command("burn-steth-permit")
  .description("Burns stETH tokens backed by the vault from the sender using permit.")
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of stETH tokens to burn")
  .argument("<permitJSON>", "JSON data required for the stETH.permit() method to set the allowance")
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.burnStETHWithPermit([BigInt(tokens), permit], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when burning stETH using permit:\n', err.message);
      }
    }
  });

dashboard
  .command("burn-wsteth-permit")
  .description("burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit")
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of wstETH tokens to burn")
  .argument("<permitJSON>", "JSON data required for the wstETH.permit() method to set the allowance")
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.burnWstETHWithPermit([BigInt(tokens), permit], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when burning wstETH using permit:\n', err.message);
      }
    }
  });

dashboard
  .command("rebalance")
  .description("rebalance the vault by transferring ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to rebalance")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.rebalanceVault([BigInt(ether)], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when rebalancing:\n', err.message);
      }
    }
  });

dashboard
  .command("recover-erc20")
  .description("recovers ERC20 tokens or ether from the dashboard contract to sender")
  .argument("<address>", "dashboard address")
  .argument("<token>", "Address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether")
  .argument("<recipient>", "Address of the recovery recipient")
  .argument("<amount>", "amount of ether to recover")
  .action(async (address: Address, token: Address, recipient: Address, amount: string) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.recoverERC20(
        [token, recipient, BigInt(amount)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when recovering:\n', err.message);
      }
    }
  });

dashboard
  .command("recover-erc721")
  .description("Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)")
  .argument("<address>", "dashboard address")
  .argument("<token>", "an ERC721-compatible token")
  .argument("<tokenId>", "token id to recover")
  .argument("<recipient>", "Address of the recovery recipient")
  .action(async (address: Address, token: Address, tokenId: string, recipient: Address) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.recoverERC721(
        [token, BigInt(tokenId), recipient],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when recovering:\n', err.message);
      }
    }
  });

dashboard
  .command("deposit-pause")
  .description("Pauses beacon chain deposits on the staking vault.")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.pauseBeaconChainDeposits({
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when pausing deposit:\n', err.message);
      }
    }
  });

dashboard
  .command("deposit-resume")
  .description("Mass-grants multiple roles to multiple accounts.")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    try {
      const tx = await contract.write.resumeBeaconChainDeposits({
        account: getAccount(),
        chain: getChain(),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when resuming deposit:\n', err.message);
      }
    }
  });

dashboard
  .command("role-grant")
  .description("Mass-revokes multiple roles from multiple accounts.")
  .argument("<address>", "dashboard address")
  .argument("<roleAssignmentJSON>", "JSON array of role assignments")
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDashboardContract(address);
    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];

    try {
      const tx = await contract.write.grantRoles(
        [payload],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when granting role:\n', err.message);
      }
    }
  });

dashboard
  .command("role-revoke")
  .description("Resumes beacon chain deposits on the staking vault.")
  .argument("<address>", "dashboard address")
  .argument("<roleAssignmentJSON>", "JSON array of role assignments")
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDashboardContract(address);
    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];

    try {
      const tx = await contract.write.revokeRoles(
        [payload],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when revoking role:\n', err.message);
      }
    }
  });

