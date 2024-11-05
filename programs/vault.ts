import { program } from "@command";
import { getStakingVaultContract } from "@contracts";
import { getAccount } from "@providers";
import { parseEther } from "viem";

const vault = program.command("v").description("vault contract");

// Views

vault
  .command("info")
  .description("get vault base info")
  .argument("<address>", "vault address")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (address, { chainId }) => {
    const contract = getStakingVaultContract(address, chainId);

    const vaultHubAddress = await contract.read.vaultHub();
    const stethAddress = await contract.read.stETH();
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

vault
  .command("l-report")
  .description("get latest vault report")
  .argument("<address>", "vault address")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (address, { chainId }) => {
    const contract = getStakingVaultContract(address, chainId);

    const report = await contract.read.latestReport();

    console.table({ "latest report": report });
  });

vault
  .command("valuation")
  .description("get vault valuation")
  .argument("<address>", "vault address")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (address, { chainId }) => {
    const contract = getStakingVaultContract(address, chainId);

    const valuation = await contract.read.valuation();

    console.table({ valuation });
  });

vault
  .command("is-healthy")
  .description("get vault isHealthy")
  .argument("<address>", "vault address")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (address, { chainId }) => {
    const contract = getStakingVaultContract(address, chainId);

    const isHealthy = await contract.read.isHealthy();

    console.table({ isHealthy });
  });

vault
  .command("unlocked")
  .description("get vault unlocked")
  .argument("<address>", "vault address")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (address, { chainId }) => {
    const contract = getStakingVaultContract(address, chainId);

    const unlocked = await contract.read.unlocked();

    console.table({ unlocked });
  });

vault
  .command("wc")
  .description("get vault withdrawal credentials")
  .argument("<vault>", "vault address")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (vault, { chainId }) => {
    const contract = getStakingVaultContract(vault, chainId);

    const wc = await contract.read.withdrawalCredentials();

    console.table({ wc });
  });

// Functions

vault
  .command("fund")
  .description("fund vault")
  .argument("<address>", "vault address")
  .argument("<amount>", "amount to fund")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (address, amount, { chainId }) => {
    const contract = getStakingVaultContract(address, chainId);

    const tx = await contract.write.fund({
      account: getAccount(chainId),
      chain: chainId,
      value: parseEther(amount),
    });

    console.table({ Transaction: tx });
  });

vault
  .command("withdraw")
  .description("withdraw from vault")
  .argument("<vault>", "vault address")
  .argument("<recipient>", "recipient address")
  .argument("<amount>", "amount to withdraw")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (vault, recipient, amount, { chainId }) => {
    const contract = getStakingVaultContract(vault, chainId);

    const tx = await contract.write.withdraw([recipient, parseEther(amount)], {
      account: getAccount(chainId),
      chain: chainId,
    });

    console.table({ Transaction: tx });
  });

vault
  .command("rebalance")
  .description("rebalance vault")
  .argument("<amount>", "amount to rebalance")
  .argument("<vault>", "vault address")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (amount, vault, { chainId }) => {
    const contract = getStakingVaultContract(vault, chainId);

    const tx = await contract.write.rebalance([parseEther(amount)], {
      account: getAccount(chainId),
      chain: chainId,
    });

    console.table({ Transaction: tx });
  });

// NOs

vault
  .command("no-deposit-beacon")
  .description("deposit to beacon chain")
  .argument("<vault>", "vault address")
  .argument("<numberOfDeposits>", "number of deposits")
  .argument("<pubkeys>", "pubkeys")
  .argument("<signatures>", "signatures")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (vault, numberOfDeposits, pubkeys, signatures, { chainId }) => {
    const contract = getStakingVaultContract(vault, chainId);

    const tx = await contract.write.depositToBeaconChain(
      [numberOfDeposits, pubkeys, signatures],
      {
        account: getAccount(chainId),
        chain: chainId,
      }
    );

    console.table({ Transaction: tx });
  });

vault
  .command("no-val-exit")
  .description("request to exit validator")
  .argument("<vault>", "vault address")
  .argument("<validatorPublicKey>", "validator public key")
  .option("-c, --chainId <chainId>", "chainId")
  .action(async (vault, validatorPublicKey, { chainId }) => {
    const contract = getStakingVaultContract(vault, chainId);

    const tx = await contract.write.requestValidatorExit([validatorPublicKey], {
      account: getAccount(chainId),
      chain: chainId,
    });

    console.table({ Transaction: tx });
  });
