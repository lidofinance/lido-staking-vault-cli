import { program } from "@command";
import {getStakingVaultContract, getStethContract} from "@contracts";
import { getAccount } from "@providers";
import { Address, parseEther } from "viem";
import { getChain } from "@configs";

const vault = program.command("v").description("vault contract");

// Views
// info - get vault base info
// l-report - get latest vault report
// valuation - get vault valuation
// unlocked - get vault unlocked
// wc - get vault withdrawal credentials
// fund - fund vault
// withdraw - withdraw from vault
// rebalance - rebalance vault // ??
// no-deposit-beacon -deposit to beacon chain
// no-val-exit - request to exit validator

// delta - inOutDelta
// ? - connect Vaults to VaultHub through protocol voting
// ? - change user permissions / roles by quorum of a pair of addresses

// Works
vault
  .command("info")
  .description("get vault base info")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const stEthContract = getStethContract();

    const vaultHubAddress = await contract.read.vaultHub();
    const stethAddress = stEthContract.address;
    const wc = await contract.read.withdrawalCredentials();
    const latestReport = await contract.read.latestReport();
    const inOutDelta = await contract.read.inOutDelta();

    console.table({
      vault: address,
      vaultHub: vaultHubAddress,
      "Withdrawal Credentials": wc,
      steth: stethAddress,
      latestReport,
      inOutDelta,
    });
  });

// Works
vault
  .command("l-report")
  .description("get latest vault report")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const report = await contract.read.latestReport();

    console.table({ "latest report": report });
  });

// Works
vault
  .command("valuation")
  .description("get vault valuation")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const valuation = await contract.read.valuation();

    console.table({ valuation });
  });

// Works
vault
  .command("unlocked")
  .description("get vault unlocked")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const unlocked = await contract.read.unlocked();

    console.table({ unlocked });
  });

// Works
vault
  .command("withdrawal-c")
  .description("get vault withdrawal credentials")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const wc = await contract.read.withdrawalCredentials();

    console.table({ wc });
  });

// Functions
// TODO: investigate why only owner can fund vault
vault
  .command("fund")
  .description("fund vault")
  .argument("<address>", "vault address")
  .argument("<amount>", "amount to fund")
  .action(async (address: Address, amount: string) => {
    const contract = getStakingVaultContract(address);

    const tx = await contract.write.fund({
      account: getAccount(),
      chain: getChain(),
      value: parseEther(amount),
    });

    console.table({ Transaction: tx });
  });

// TODO: investigate why only owner can fund vault
vault
  .command("withdraw")
  .description("withdraw from vault")
  .argument("<address>", "vault address")
  .argument("<recipient>", "recipient address")
  .argument("<amount>", "amount to withdraw")
  .action(async (address: Address, recipient: Address, amount: string) => {
    const contract = getStakingVaultContract(address);

    const tx = await contract.write.withdraw([recipient, parseEther(amount)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

// TODO: fund balance and retest
vault
  .command("rebalance")
  .description("rebalance vault")
  .argument("<address>", "vault address")
  .argument("<amount>", "amount to rebalance")
  .action(async (address: Address, amount: Address) => {
    const contract = getStakingVaultContract(address);

    const tx = await contract.write.rebalance([parseEther(amount)], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

// NOs
// TODO: get more details
vault
  .command("no-deposit-beacon")
  .description("deposit to beacon chain")
  .argument("<address>", "vault address")
  .argument("<numberOfDeposits>", "number of deposits")
  .argument("<pubkeys>", "pubkeys")
  .argument("<signatures>", "signatures")
  .action(async (vault: Address, numberOfDeposits: string, pubkeys: Address, signatures: Address) => {
    const nod = BigInt(numberOfDeposits);
    const contract = getStakingVaultContract(vault);

    const tx = await contract.write.depositToBeaconChain(
      [nod, pubkeys, signatures],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

// TODO: get more details
vault
  .command("no-val-exit")
  .description("request to exit validator")
  .argument("<address>", "vault address")
  .argument("<validatorPublicKey>", "validator public key")
  .action(async (address: Address, validatorPublicKey: Address) => {
    const contract = getStakingVaultContract(address);

    const tx = await contract.write.requestValidatorExit([validatorPublicKey], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

// Works
vault
  .command("delta")
  .description("the net difference between deposits and withdrawals")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const inOutDelta = await contract.read.inOutDelta();

    console.table({ 'In Out Delta': inOutDelta });
  });
