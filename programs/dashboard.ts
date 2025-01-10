import { program } from "@command";
import { getDashboardContract } from "@contracts";
import { Address } from "viem";
import { getAccount } from "@providers";
import { getChain } from "@configs";
import { Permit } from "@types";

const dashboard = program.command("d").description("dashboard contract");

dashboard
  .command("info")
  .description("get dashboard base info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    const steth = contract.read.STETH;
    const wsteth = contract.read.WSTETH;
    const weth = contract.read.WETH;
    const isInit = contract.read.isInitialized;
    const vault = contract.read.stakingVault;

    console.table({
      steth,
      wsteth,
      weth,
      vault,
      isInit,
    });
  });

dashboard
  .command("init")
  .description("initialize dashboard")
  .argument("<address>", "dashboard address")
  .argument("<vault>", "vault address")
  .action(async (address: Address, vault: Address) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.initialize([vault], {
      chain: getChain(),
      account: getAccount(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("vault")
  .description("vault info")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vaultInfo = await contract.read.vaultSocket();

    console.table(vaultInfo);
  });

dashboard
  .command("s-limit")
  .description("shares limit")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const shareLimit = await contract.read.shareLimit();

    console.table({ 'Share limit': shareLimit });
  });

dashboard
  .command("s-minted")
  .description("shares minted")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const sharesMinted = await contract.read.sharesMinted();

    console.table({ 'Share minted': sharesMinted });
  });

dashboard
  .command("reserve-ratio")
  .description("vault reserve ratio of the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const reserveRatio = await contract.read.reserveRatio();

    console.table({ 'Reserve ratio': reserveRatio });
  });

dashboard
  .command("t-reserve-ratio")
  .description("threshold reserve ratio of the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const thresholdReserveRatio = await contract.read.thresholdReserveRatio();

    console.table({ 'Threshold reserve ratio': thresholdReserveRatio });
  });

dashboard
  .command("t-fee")
  .description("treasury fee basis points")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const treasuryFee = await contract.read.treasuryFee();

    console.table({ 'Treasury fee': treasuryFee });
  });

dashboard
  .command("valuation")
  .description("valuation of the vault in ether")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const valuation = await contract.read.valuation();

    console.table({ Valuation: valuation });
  });

dashboard
  .command("t-shares")
  .description("total of shares that can be minted on the vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const totalMintableShares = await contract.read.totalMintableShares();

    console.table({ 'Total mintable shares': totalMintableShares });
  });

dashboard
  .command("get-shares")
  .description("maximum number of shares that can be minted with deposited ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to be funded")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const mintableShares = await contract.read.getMintableShares([BigInt(ether)]);

    console.table({ 'Mintable shares': mintableShares });
  });

dashboard
  .command("get-w-eth")
  .description("amount of ether that can be withdrawn from the staking vault")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const withdrawableEther = await contract.read.getWithdrawableEther();

    console.table({ 'Withdrawable ether': withdrawableEther });
  });

dashboard
  .command("ownership")
  .description("transfers ownership of the staking vault to a new owner")
  .argument("<address>", "dashboard address")
  .argument("<newOwner>", "address of the new owner")
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.transferStVaultOwnership(
      [newOwner],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

dashboard
  .command("disconnect")
  .description("disconnects the staking vault from the vault hub.")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.voluntaryDisconnect({
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("disconnect")
  .description("disconnects the staking vault from the vault hub")
  .argument("<address>", "dashboard address")
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.voluntaryDisconnect({
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("fund")
  .description("funds the staking vault with ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to be funded")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.fund({
      account: getAccount(),
      chain: getChain(),
      value: BigInt(ether),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("fund-weth")
  .description("funds the staking vault with wrapped ether")
  .argument("<address>", "dashboard address")
  .argument("<wethAmount>", "amount of weth to be funded")
  .action(async (address: Address, wethAmount: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.fundByWeth([BigInt(wethAmount)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("withdraw")
  .description("withdraws ether from the staking vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<ether>", "amount of ether to withdraw")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.withdraw([recipient, BigInt(ether)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("withdraw-weth")
  .description("withdraws stETH tokens from the staking vault to wrapped ether")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<ether>", "amount of ether to withdraw")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.withdrawToWeth([recipient, BigInt(ether)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("exit")
  .description("requests the exit of a validator from the staking vault")
  .argument("<address>", "dashboard address")
  .argument("<validatorPubKey>", "public key of the validator to exit")
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.requestValidatorExit([validatorPubKey], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("mint")
  .description("mints stETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.mint([recipient, BigInt(amountOfShares)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("mint-wsteth")
  .description("mints wstETH tokens backed by the vault to a recipient")
  .argument("<address>", "dashboard address")
  .argument("<recipient>", "address of the recipient")
  .argument("<tokens>", "amount of tokens to mint")
  .action(async (address: Address, recipient: Address, tokens: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.mintWstETH([recipient, BigInt(tokens)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("burn")
  .description("burn stETH shares from the sender backed by the vault")
  .argument("<address>", "dashboard address")
  .argument("<amountOfShares>", "amount of shares to burn")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.burn([BigInt(amountOfShares)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("burn-wsteth")
  .description("burn wstETH tokens from the sender backed by the vault")
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of wstETH tokens to burn")
  .action(async (address: Address, tokens: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.burnWstETH([BigInt(tokens)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("burn-permit")
  .description("burn stETH tokens from the sender backed by the vault using EIP-2612 Permit")
  .argument("<address>", "dashboard address")
  .argument("<tokens>", "amount of stETH tokens to burn")
  .argument("<permitJSON>", "JSON data required for the stETH.permit() method to set the allowance")
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDashboardContract(address);
    const tx = await contract.write.burnWithPermit([BigInt(tokens), permit], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
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
    const tx = await contract.write.burnWstETHWithPermit([BigInt(tokens), permit], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

dashboard
  .command("rebalance")
  .description("rebalance the vault by transferring ether")
  .argument("<address>", "dashboard address")
  .argument("<ether>", "amount of ether to rebalance")
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const tx = await contract.write.rebalanceVault([BigInt(ether)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

