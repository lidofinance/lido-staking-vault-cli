import { Address } from "viem";

import { program } from "@command";
import { getDelegationContract } from "@contracts";
import { getAccount } from "@providers";
import { getChain } from "@configs";

const delegation = program.command("del").description("delegation contract");

delegation
  .command("roles")
  .description("get delegation contract roles info")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const CURATOR_ROLE = await contract.read.CURATOR_ROLE();
      const NODE_OPERATOR_MANAGER_ROLE = await contract.read.NODE_OPERATOR_MANAGER_ROLE();
      const NODE_OPERATOR_FEE_CLAIMER_ROLE = await contract.read.NODE_OPERATOR_FEE_CLAIMER_ROLE();
      const FUND_ROLE = await contract.read.FUND_ROLE();
      const WITHDRAW_ROLE = await contract.read.WITHDRAW_ROLE();
      const MINT_ROLE = await contract.read.MINT_ROLE();
      const BURN_ROLE = await contract.read.BURN_ROLE();
      const REBALANCE_ROLE = await contract.read.REBALANCE_ROLE();
      const PAUSE_BEACON_CHAIN_DEPOSITS_ROLE = await contract.read.PAUSE_BEACON_CHAIN_DEPOSITS_ROLE();
      const RESUME_BEACON_CHAIN_DEPOSITS_ROLE = await contract.read.RESUME_BEACON_CHAIN_DEPOSITS_ROLE();
      const REQUEST_VALIDATOR_EXIT_ROLE = await contract.read.REQUEST_VALIDATOR_EXIT_ROLE();
      const VOLUNTARY_DISCONNECT_ROLE = await contract.read.VOLUNTARY_DISCONNECT_ROLE();

      const payload = {
        CURATOR_ROLE,
        NODE_OPERATOR_MANAGER_ROLE,
        NODE_OPERATOR_FEE_CLAIMER_ROLE,
        FUND_ROLE,
        WITHDRAW_ROLE,
        MINT_ROLE,
        BURN_ROLE,
        REBALANCE_ROLE,
        PAUSE_BEACON_CHAIN_DEPOSITS_ROLE,
        RESUME_BEACON_CHAIN_DEPOSITS_ROLE,
        REQUEST_VALIDATOR_EXIT_ROLE,
        VOLUNTARY_DISCONNECT_ROLE,
      }

      console.table(Object.entries(payload));
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting roles:\n', err.message);
      }
    }
  });

delegation
  .command("voting-lifetime")
  .description("get committee's voting lifetime period")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    try {
      const voteLifetime = await contract.read.voteLifetime();

      console.table({ 'Vote Lifetime': voteLifetime });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting vote lifetime:\n', err.message);
      }
    }
  });

delegation
  .command("voting-info")
  .description("get committee votes")
  .argument("<address>", "delegation contract address")
  .argument("<callId>", "voting id")
  .argument("<role>", "role that voted")
  .action(async (address: Address, callId: Address, role: Address) => {
    const contract = getDelegationContract(address);
    
    try {
      const voting = await contract.read.votings([callId, role]);
      console.table({ voting });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting voting:\n', err.message);
      }
    }
  });

delegation
  .command("cf")
  .description("Curator fee in basis points")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const curatorFeeBP = await contract.read.curatorFeeBP();
      console.table({ 'Curator Fee in BP': curatorFeeBP });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting Curator Fee BP:\n', err.message);
      }
    }
  });

delegation
  .command("cf-report")
  .description("The last report for which curator fee was claimed. Updated on each claim.")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const report = await contract.read.curatorFeeClaimedReport();
      console.table({ 'Curator Fee Report': report });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting Curator Report:\n', err.message);
      }
    }
  });

delegation
  .command("cf-unclaimed")
  .description(`Returns the accumulated unclaimed curator fee in ether,
    calculated as: U = (R * F) / T
    where:
    - U is the curator unclaimed fee;
    - R is the StakingVault rewards accrued since the last curator fee claim;
    - F is curatorFeeBP
    - T is the total basis points, 10,000.`)
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const unclaimed = await contract.read.curatorUnclaimedFee();
      console.table({ "Curator's accumulated unclaimed fee in ether": unclaimed });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting Curator\'s accumulated unclaimed fee:\n', err.message);
      }
    }
  });

delegation
  .command("cf-set")
  .description("sets the curator fee")
  .argument("<address>", "delegation contract address")
  .argument("<newCuratorFee>", "curator fee in basis points")
  .action(async (address: Address, newCuratorFee: string) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.setCuratorFeeBP(
        [BigInt(newCuratorFee)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when setting curator fee:\n', err.message);
      }
    }
  });

delegation
  .command("cf-claim")
  .description("claims the curator fee")
  .argument("<address>", "delegation contract address")
  .argument("<recipient>", "address to which the curator fee will be sent")
  .action(async (address: Address, recipient: Address) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.claimCuratorFee(
        [recipient],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when claiming curator fee:\n', err.message);
      }
    }
  });

delegation
  .command("nof")
  .description("Node operator fee in basis points")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const nodeOperatorFeeBP = await contract.read.nodeOperatorFeeBP();
      console.table({ 'Node Operator Fee BP:': nodeOperatorFeeBP });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting Node Operator Fee BP:\n', err.message);
      }
    }
  });

delegation
  .command("nof-report")
  .description("The last report for which node operator fee was claimed. Updated on each claim.")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const report = await contract.read.nodeOperatorFeeClaimedReport();
      console.table({ 'Node Operator Report:': report });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting Node Operator Report:\n', err.message);
      }
    }
  });


delegation
  .command("nof-unclaimed")
  .description(`Returns the accumulated unclaimed node operator fee in ether,
    calculated as: U = (R * F) / T
    where:
    - U is the node operator unclaimed fee;
    - R is the StakingVault rewards accrued since the last node operator fee claim;
    - F is nodeOperatorFeeBP
    - T is the total basis points, 10,000.`)
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const unclaimed = await contract.read.nodeOperatorUnclaimedFee();
      console.table({ "Node operator's accumulated unclaimed fee in ether": unclaimed });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting node operator\'s accumulated unclaimed fee:\n', err.message);
      }
    }
  });

delegation
  .command("nof-set")
  .description("sets the node operator fee")
  .argument("<address>", "delegation contract address")
  .argument("<newNodeOperatorFeeBP>", "The new node operator fee in basis points")
  .action(async (address: Address, newNodeOperatorFeeBP: string) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.setNodeOperatorFeeBP(
        [BigInt(newNodeOperatorFeeBP)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when setting node operator fee:\n', err.message);
      }
    }
  });

delegation
  .command("nof-claim")
  .description("claims the node operator fee")
  .argument("<address>", "delegation contract address")
  .argument("<recipient>", "address to which the node operator fee will be sent")
  .action(async (address: Address, recipient: Address) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.claimNodeOperatorFee(
        [recipient],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when claiming node operator fee:\n', err.message);
      }
    }
  });

delegation
  .command("unreserved")
  .description("returns the unreserved amount of ether")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const unreserved = await contract.read.unreserved();
      console.table({ Unreserved: unreserved });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting unreserved:\n', err.message);
      }
    }
  });

delegation
  .command("vc")
  .description("returns the voting committee")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const committeeList = await contract.read.votingCommittee();
      const committee = {
        CURATOR_ROLE: committeeList[0],
        NODE_OPERATOR_MANAGER_ROLE: committeeList[1],
      };

      console.table({ committee });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when getting the voting committee:\n', err.message);
      }
    }
  });

delegation
  .command("fund")
  .description("funds the StakingVault with ether")
  .argument("<address>", "delegation contract address")
  .argument("<ether>", "ether to found")
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);

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

delegation
  .command("withdraw")
  .description("withdraws ether from the StakingVault")
  .argument("<address>", "delegation contract address")
  .argument("<recipient>", "address to which the ether will be sent")
  .argument("<ether>", "ether to found")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.withdraw(
        [recipient, BigInt(ether)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when withdrawing:\n', err.message);
      }
    }
  });

delegation
  .command("mint")
  .description("mints shares for a given recipient")
  .argument("<address>", "delegation contract address")
  .argument("<recipient>", "address to which the ether will be sent")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.mintShares(
        [recipient, BigInt(amountOfShares)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when minting:\n', err.message);
      }
    }
  });

delegation
  .command("burn")
  .description("burns shares for a given recipient")
  .argument("<address>", "delegation contract address")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.burnShares(
        [BigInt(amountOfShares)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when burning:\n', err.message);
      }
    }
  });

delegation
  .command("rebalance")
  .description("rebalances the StakingVault with a given amount of ether")
  .argument("<address>", "delegation contract address")
  .argument("<ether>", "amount of ether to rebalance with")
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.rebalanceVault(
        [BigInt(ether)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when rebalancing:\n', err.message);
      }
    }
  });

delegation
  .command("set-vote-lt")
  .description("sets the vote lifetime")
  .argument("<address>", "delegation contract address")
  .argument("<newVoteLifetime>", "new vote lifetime in seconds")
  .action(async (address: Address, newVoteLifetime: string) => {
    const contract = getDelegationContract(address)
    try {
      const tx = await contract.write.setVoteLifetime(
        [BigInt(newVoteLifetime)],
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when setVoteLifetime:\n', err.message);
      }
    }
  });

delegation
  .command("t-ownership")
  .description("transfers the ownership of the StakingVault")
  .argument("<address>", "delegation contract address")
  .argument("<newOwner>", "address to which the ownership will be transferred")
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDelegationContract(address);
    
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
        console.log('Error when transferStVaultOwnership:\n', err.message);
      }
    }
  });

delegation
  .command("disconnect")
  .description("voluntarily disconnects a StakingVault from VaultHub")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.voluntaryDisconnect(
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when voluntaryDisconnect:\n', err.message);
      }
    }
  });

delegation
  .command("deposit-pause")
  .description("Pauses deposits to beacon chain from the StakingVault.")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.pauseBeaconChainDeposits(
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when pauseBeaconChainDeposits:\n', err.message);
      }
    }
  });

delegation
  .command("deposit-resume")
  .description("Resumes deposits to beacon chain from the StakingVault.")
  .argument("<address>", "delegation contract address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const tx = await contract.write.resumeBeaconChainDeposits(
        {
          account: getAccount(),
          chain: getChain(),
        }
      );

      console.table({ Transaction: tx });
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error when resumeBeaconChainDeposits:\n', err.message);
      }
    }
  });
