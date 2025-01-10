import { Address } from "viem";

import { program } from "@command";
import { getDelegationContract } from "@contracts";
import { getAccount } from "@providers";
import { getChain } from "@configs";

const delegation = program.command("del").description("delegation contract");

delegation
  .command("info")
  .description("get delegation contract base info")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    const curator = contract.read.CURATOR_ROLE;
    const curatorFee = contract.read.curatorFee;
    const curatorReport = contract.read.curatorDueClaimedReport;
    const staker = contract.read.STAKER_ROLE;
    const tokenMaster = contract.read.TOKEN_MASTER_ROLE;
    const operator = contract.read.OPERATOR_ROLE;
    const operatorFee = contract.read.operatorFee;
    const voteLifetime = contract.read.voteLifetime;

    console.table({
      curator,
      curatorFee,
      curatorReport,
      staker,
      tokenMaster,
      operator,
      operatorFee,
      voteLifetime,
    });
  });

delegation
  .command("voting-info")
  .description("get committee votes")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const votings = contract.read.votings;

    console.table(votings);
  });

delegation
  .command("init")
  .description("initializes a contract")
  .argument("<address>", "delegation contract address")
  .argument("<vault>", "vault contract address")
  .action(async (address: Address, vault: Address) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.initialize([vault], {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  });

delegation
  .command("cd")
  .description("return the accumulated curator due in ether")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const curatorDue = await contract.read.curatorDue();

    console.table({ 'Curator due': curatorDue });
  });

delegation
  .command("od")
  .description("return the accumulated operator due in ether")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const operatorDue = await contract.read.operatorDue();

    console.table({ 'Operator due': operatorDue });
  });

delegation
  .command("unreserved")
  .description("returns the unreserved amount of ether")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const unreserved = await contract.read.unreserved();

    console.table({ Unreserved: unreserved });
  });

delegation
  .command("vc")
  .description("returns the committee")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const committee = await contract.read.votingCommittee();

    console.table({ Committee: committee });
  });

delegation
  .command("fund")
  .description("funds the StakingVault with ether")
  .argument("<address>", "delegation contract address")
  .argument("<ether>", "ether to found")
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.fund({
      account: getAccount(),
      chain: getChain(),
      value: BigInt(ether),
    });

    console.table({ Transaction: tx });
  });

delegation
  .command("withdraw")
  .description("withdraws ether from the StakingVault")
  .argument("<address>", "delegation contract address")
  .argument("<recipient>", "address to which the ether will be sent")
  .argument("<ether>", "ether to found")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.withdraw(
      [recipient, BigInt(ether)],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("mint")
  .description("mints shares for a given recipient")
  .argument("<address>", "delegation contract address")
  .argument("<recipient>", "address to which the ether will be sent")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.mint(
      [recipient, BigInt(amountOfShares)],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("burn")
  .description("burns shares for a given recipient")
  .argument("<address>", "delegation contract address")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.burn(
      [BigInt(amountOfShares)],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("rebalance")
  .description("rebalances the StakingVault with a given amount of ether")
  .argument("<address>", "delegation contract address")
  .argument("<ether>", "amount of ether to rebalance with")
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.rebalanceVault(
      [BigInt(ether)],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("vote-lifetime")
  .description("sets the vote lifetime")
  .argument("<address>", "delegation contract address")
  .argument("<newVoteLifetime>", "new vote lifetime in seconds")
  .action(async (address: Address, newVoteLifetime: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.setVoteLifetime(
      [BigInt(newVoteLifetime)],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("curator-fee")
  .description("sets the curator fee")
  .argument("<address>", "delegation contract address")
  .argument("<newCuratorFee>", "curator fee in basis points")
  .action(async (address: Address, newCuratorFee: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.setCuratorFee(
      [BigInt(newCuratorFee)],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("operator-fee")
  .description("sets the operator fee")
  .argument("<address>", "delegation contract address")
  .argument("<newOperatorFee>", "operator fee in basis points")
  .action(async (address: Address, newOperatorFee: string) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.setOperatorFee(
      [BigInt(newOperatorFee)],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("curator-due")
  .description("claims the curator due")
  .argument("<address>", "delegation contract address")
  .argument("<curator>", "address to which the curator due will be sent")
  .action(async (address: Address, curator: Address) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.claimCuratorDue(
      [curator],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("operator-due")
  .description("claims the operator due")
  .argument("<address>", "delegation contract address")
  .argument("<operator>", "address to which the operator due will be sent")
  .action(async (address: Address, operator: Address) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.claimOperatorDue(
      [operator],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("t-ownership")
  .description("transfers the ownership of the StakingVault")
  .argument("<address>", "delegation contract address")
  .argument("<newOwner>", "address to which the ownership will be transferred")
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.transferStVaultOwnership(
      [newOwner],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });

delegation
  .command("disconnect")
  .description("voluntarily disconnects a StakingVault from VaultHub")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const tx = await contract.write.voluntaryDisconnect(
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  });
