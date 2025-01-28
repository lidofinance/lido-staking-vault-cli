import { program } from "@command";
import { getStakingVaultContract } from "@contracts";
import { getAccount } from "@providers";
import { Address, parseEther } from "viem";
import { getChain } from "@configs";

const vault = program.command("v").description("vault contract");

// Views
// info - get vault base info
// l-report - get latest vault report
// valuation - get vault valuation
// unlocked - get vault unlocked
// locked - get vault locked
// is-balanced - vault isBalanced
// withdrawal-c - get vault withdrawal credentials
// fund - fund vault
// withdraw - withdraw from vault
// no-deposit-beacon -deposit to beacon chain
// no-val-exit - request to exit validator
// delta - inOutDelta

// ? - change user permissions / roles by quorum of a pair of addresses

// Works
vault
  .command("info")
  .description("get vault base info")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    try {
      const withdrawalCredentials = await contract.read.withdrawalCredentials();
      const latestReport = await contract.read.latestReport();
      const inOutDelta = await contract.read.inOutDelta();
      const version = await contract.read.version();
      const initializedVersion = await contract.read.getInitializedVersion();
      const depositContract = await contract.read.depositContract();
      const nodeOperator = await contract.read.nodeOperator();
      const isBalanced = await contract.read.isBalanced();

      const payload = {
        vault: address,
        withdrawalCredentials,
        latestReport,
        inOutDelta,
        version,
        initializedVersion,
        depositContract,
        nodeOperator,
        isBalanced,
      }

      console.table(payload);
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command("l-report")
  .description("get latest vault report")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    try {
      const latestReport = await contract.read.latestReport();

      console.table({ "latest report": latestReport });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command("is-balanced")
  .description("returns whether `StakingVault` is balanced, i.e. its valuation is greater than the locked amount")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    try {
      const isBalanced = await contract.read.isBalanced();

      console.table({"Is balanced": isBalanced});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command("valuation")
  .description("get vault valuation")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    try {
      const valuation = await contract.read.valuation();

      console.table({valuation});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command("unlocked")
  .description("get vault unlocked")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    try {
      const unlocked = await contract.read.unlocked();

      console.table({unlocked});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command("locked")
  .description("get vault locked")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    try {
      const locked = await contract.read.locked();

      console.table({locked});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command("withdrawal-c")
  .description("get vault withdrawal credentials")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    try {
      const wc = await contract.read.withdrawalCredentials();

      console.table({wc});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vault
  .command("fund")
  .description("fund vault")
  .argument("<address>", "vault address")
  .argument("<amount>", "amount to fund")
  .action(async (address: Address, amount: string) => {
    const contract = getStakingVaultContract(address);

    try {
      const tx = await contract.write.fund({
        account: getAccount(),
        chain: getChain(),
        value: parseEther(amount),
      });

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
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

// NOs
// TODO: get more details
vault
  .command("no-deposit-beacon")
  .description("deposit to beacon chain")
  .argument("<address>", "vault address")
  .argument("<amountOfDeposit>", "amount of deposits")
  .argument("<pubkey>", "pubkey")
  .argument("<signature>", "signature")
  .argument("<depositDataRoot>", "depositDataRoot")
  .action(async (
    vault: Address,
    amountOfDeposit: string,
    pubkey: `0x${string}`,
    signature: `0x${string}`,
    depositDataRoot:
    `0x${string}`
  ) => {
    const amount = BigInt(amountOfDeposit);
    const contract = getStakingVaultContract(vault);

    const payload = [{
      pubkey,
      signature,
      amount,
      depositDataRoot
    }];

    try {
      const tx = await contract.write.depositToBeaconChain(
        [payload],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({Transaction: tx});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// TODO: get more details
vault
  .command("no-val-exit")
  .description("request to exit validator")
  .argument("<address>", "vault address")
  .argument("<validatorPublicKey>", "validator public key")
  .action(async (address: Address, validatorPublicKey: Address) => {
    const contract = getStakingVaultContract(address);

    try {
      const tx = await contract.write.requestValidatorExit([validatorPublicKey], {
        account: getAccount(),
        chain: getChain(),
      });

      console.table({Transaction: tx});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command("delta")
  .description("the net difference between deposits and withdrawals")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    try {
      const inOutDelta = await contract.read.inOutDelta();

      console.table({'In Out Delta': inOutDelta});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vault
  .command("is-paused")
  .description("Returns whether deposits are paused by the vault owner")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    try {
      const isPaused = await contract.read.beaconChainDepositsPaused();

      console.table({'Is paused': isPaused});
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vault
  .command("bc-resume")
  .description("Resumes deposits to beacon chain")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    try {
      const tx = await contract.write.resumeBeaconChainDeposits({
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

vault
  .command("bc-pause")
  .description("Pauses deposits to beacon chain")
  .argument("<address>", "vault address")
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    try {
      const tx = await contract.write.pauseBeaconChainDeposits({
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

vault
  .command("report")
  .description("Submits a report containing valuation, inOutDelta, and locked amount")
  .argument("<address>", "vault address")
  .argument("<valuation>", "New total valuation: validator balances + StakingVault balance")
  .argument("<inOutDelta>", "New net difference between funded and withdrawn ether")
  .argument("<locked>", "New amount of locked ether")
  .action(async (address: Address, valuation: string, inOutDelta: string, locked: string) => {
    const contract = getStakingVaultContract(address);
    try {
      const tx = await contract.write.report(
        [BigInt(valuation), BigInt(inOutDelta), BigInt(locked)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ 'Transaction': tx });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

vault
  .command("report")
  .description("Submits a report containing valuation, inOutDelta, and locked amount")
  .argument("<address>", "vault address")
  .argument("<pubkey>", "Validator public key, 48 bytes")
  .argument("<withdrawalCredentials>", "Withdrawal credentials, 32 bytes")
  .argument("<signature>", "Signature of the deposit, 96 bytes")
  .argument("<amount>", "Amount of ether to deposit, in wei")
  .action(async (
    address: Address,
    pubkey: `0x${string}`,
    withdrawalCredentials: `0x${string}`,
    signature: `0x${string}`,
    amount: string
  ) => {
    const contract = getStakingVaultContract(address);
    try {
      const encodedData = await contract.read.computeDepositDataRoot(
        [pubkey, withdrawalCredentials, signature, BigInt(amount)]
      );

      console.table({ 'Encoded data': encodedData });
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });
