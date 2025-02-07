import { Address } from "viem";

import { program } from "@command";
import { getDelegationContract, getStakingVaultContract }  from "@contracts";
import { getAccount } from "@providers";
import { getChain } from "@configs";
import { Permit } from "@types";
import {
  burnShares,
  burnSharesWithPermit,
  burnStETH,
  burnStETHWithPermit,
  burnWstETH,
  burnWstETHWithPermit,
  fund,
  fundWeth,
  getBaseInfo,
  getCommittee,
  getProjectedNewMintableShares,
  getReserveRatioBP,
  getShareLimit,
  getSharesMinted,
  getThresholdReserveRatioBP,
  getTotalMintableShares,
  getTreasuryFee,
  getValuation,
  getVaultSocket,
  getWithdrawableEther,
  grantRoles,
  mintShares,
  mintStETH,
  mintWstETH,
  pauseBeaconChainDeposits,
  rebalanceVault,
  recoverERC20,
  recoverERC721,
  requestValidatorExit,
  resumeBeaconChainDeposits,
  revokeRoles,
  transferStakingVaultOwnership,
  voluntaryDisconnect,
  withdraw,
  withdrawWETH
} from "@features";

const delegation = program.command("delegation").description("delegation contract");

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
  .command("base-info")
  .description("get delegation base info")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getBaseInfo(contract);
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
  .command("is-healthy")
    .description("get vault healthy info")
    .argument("<address>", "vault address")
    .action(async (address: Address) => {
      const contract = getDelegationContract(address);

      try {
        const valuation = await contract.read.valuation();
        const curatorUnclaimedFee = await contract.read.curatorUnclaimedFee();
        const nodeOperatorUnclaimedFee = await contract.read.nodeOperatorUnclaimedFee();
        const minted = await contract.read.sharesMinted();

        const { vault } = await contract.read.vaultSocket();
        const vaultContract = getStakingVaultContract(vault);
        const locked = await vaultContract.read.locked();

        const reserved = locked + curatorUnclaimedFee + nodeOperatorUnclaimedFee;
        const valuationPerc = valuation / (reserved + minted) * 100n;
        const isHealthy = valuationPerc >= 100n;

        console.table({
          'Vault Healthy': isHealthy,
          'Valuation': valuation,
          'Curator Unclaimed Fee': curatorUnclaimedFee,
          'Node Operator Unclaimed Fee': nodeOperatorUnclaimedFee,
          'Minted': minted,
          'Reserved': reserved,
        })
      } catch (err) {
        if (err instanceof Error) {
          console.log('Error when getting info:\n', err.message);
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
    await fund(contract, BigInt(ether));
  });

delegation
  .command("withdraw")
  .description("withdraws ether from the StakingVault")
  .argument("<address>", "delegation contract address")
  .argument("<recipient>", "address to which the ether will be sent")
  .argument("<ether>", "ether to found")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);
    await withdraw(contract, [recipient, BigInt(ether)]);
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
    await rebalanceVault(contract, [BigInt(ether)]);
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

delegation
  .command("committee")
  .description("voting committee info")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getCommittee(contract);
  });

delegation
  .command("vault")
  .description("vault info")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getVaultSocket(contract);
  });

delegation
  .command("s-limit")
  .description("shares limit")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getShareLimit(contract);
  });

delegation
  .command("s-minted")
  .description("shares minted")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getSharesMinted(contract);
  });

delegation
  .command("reserve-ratio")
  .description("vault reserve ratio of the vault")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getReserveRatioBP(contract);
  });

delegation
  .command("t-reserve-ratio")
  .description("threshold reserve ratio of the vault")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getThresholdReserveRatioBP(contract);
  });

delegation
  .command("t-fee")
  .description("treasury fee basis points")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getTreasuryFee(contract);
  });

delegation
  .command("valuation")
  .description("valuation of the vault in ether")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getValuation(contract);
  });

delegation
  .command("t-shares")
  .description("total of shares that can be minted on the vault")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getTotalMintableShares(contract);
  });

delegation
  .command("get-shares")
  .description("maximum number of shares that can be minted with deposited ether")
  .argument("<address>", "delegation address")
  .argument("<ether>", "amount of ether to be funded")
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);
    await getProjectedNewMintableShares(contract, [BigInt(ether)]);
  });

delegation
  .command("withdrawable-eth")
  .description("amount of ether that can be withdrawn from the staking vault")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getWithdrawableEther(contract);
  });

// TODO: test without voting
delegation
  .command("ownership")
  .description("transfers ownership of the staking vault to a new owner")
  .argument("<address>", "delegation address")
  .argument("<newOwner>", "address of the new owner")
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDelegationContract(address);
    await transferStakingVaultOwnership(contract, [newOwner]);
  });

delegation
  .command("disconnect")
  .description("disconnects the staking vault from the vault hub")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await voluntaryDisconnect(contract);
  });

delegation
  .command("fund-weth")
  .description("funds the staking vault with wrapped ether")
  .argument("<address>", "delegation address")
  .argument("<wethAmount>", "amount of weth to be funded")
  .action(async (address: Address, wethAmount: string) => {
    const contract = getDelegationContract(address);
    await fundWeth(contract, [BigInt(wethAmount)]);
  });

delegation
  .command("withdraw-weth")
  .description("withdraws stETH tokens from the staking vault to wrapped ether")
  .argument("<address>", "delegation address")
  .argument("<recipient>", "address of the recipient")
  .argument("<ether>", "amount of ether to withdraw")
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);
    await withdrawWETH(contract, [recipient, BigInt(ether)])
  });

delegation
  .command("exit")
  .description("requests the exit of a validator from the staking vault")
  .argument("<address>", "delegation address")
  .argument("<validatorPubKey>", "public key of the validator to exit")
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDelegationContract(address);
    await requestValidatorExit(contract, [validatorPubKey]);
  });

delegation
  .command("mint-shares")
  .description("mints stETH tokens backed by the vault to a recipient")
  .argument("<address>", "delegation address")
  .argument("<recipient>", "address of the recipient")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);
    await mintShares(contract, [recipient, BigInt(amountOfShares)])
  });

delegation
  .command("mint-steth")
  .description("mints stETH tokens backed by the vault to a recipient")
  .argument("<address>", "delegation address")
  .argument("<recipient>", "address of the recipient")
  .argument("<amountOfShares>", "amount of shares to mint")
  .action(async (address: Address, recipient: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);
    await mintStETH(contract, [recipient, BigInt(amountOfShares)]);
  });

delegation
  .command("mint-wsteth")
  .description("mints wstETH tokens backed by the vault to a recipient")
  .argument("<address>", "delegation address")
  .argument("<recipient>", "address of the recipient")
  .argument("<tokens>", "amount of tokens to mint")
  .action(async (address: Address, recipient: Address, tokens: string) => {
    const contract = getDelegationContract(address);
    await mintWstETH(contract, [recipient, BigInt(tokens)]);
  });

delegation
  .command("burn-shares")
  .description("Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract")
  .argument("<address>", "delegation address")
  .argument("<amountOfShares>", "amount of shares to burn")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);
    await burnShares(contract, [BigInt(amountOfShares)]);
  });

delegation
  .command("burn-steth")
  .description("Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.")
  .argument("<address>", "delegation address")
  .argument("<amountOfShares>", "amount of shares to burn")
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);
    await burnStETH(contract, [BigInt(amountOfShares)])
  });

delegation
  .command("burn-wsteth")
  .description("burn wstETH tokens from the sender backed by the vault")
  .argument("<address>", "delegation address")
  .argument("<tokens>", "amount of wstETH tokens to burn")
  .action(async (address: Address, tokens: string) => {
    const contract = getDelegationContract(address);
    await burnWstETH(contract, [BigInt(tokens)]);
  });

delegation
  .command("burn-shares-permit")
  .description("Burns stETH tokens (in shares) backed by the vault from the sender using permit (with value in stETH).")
  .argument("<address>", "delegation address")
  .argument("<tokens>", "amount of stETH tokens to burn")
  .argument("<permitJSON>", "JSON data required for the stETH.permit() method to set the allowance")
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDelegationContract(address);
    await burnSharesWithPermit(contract, [BigInt(tokens), permit]);
  });

delegation
  .command("burn-steth-permit")
  .description("Burns stETH tokens backed by the vault from the sender using permit.")
  .argument("<address>", "delegation address")
  .argument("<tokens>", "amount of stETH tokens to burn")
  .argument("<permitJSON>", "JSON data required for the stETH.permit() method to set the allowance")
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDelegationContract(address);
    await burnStETHWithPermit(contract, [BigInt(tokens), permit]);
  });

delegation
  .command("burn-wsteth-permit")
  .description("burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit")
  .argument("<address>", "delegation address")
  .argument("<tokens>", "amount of wstETH tokens to burn")
  .argument("<permitJSON>", "JSON data required for the wstETH.permit() method to set the allowance")
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDelegationContract(address);
    await burnWstETHWithPermit(contract, [BigInt(tokens), permit]);
  });

delegation
  .command("recover-erc20")
  .description("recovers ERC20 tokens or ether from the delegation contract to sender")
  .argument("<address>", "delegation address")
  .argument("<token>", "Address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether")
  .argument("<recipient>", "Address of the recovery recipient")
  .argument("<amount>", "amount of ether to recover")
  .action(async (address: Address, token: Address, recipient: Address, amount: string) => {
    const contract = getDelegationContract(address);
    await recoverERC20(contract, [token, recipient, BigInt(amount)]);
  });

delegation
  .command("recover-erc721")
  .description("Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)")
  .argument("<address>", "delegation address")
  .argument("<token>", "an ERC721-compatible token")
  .argument("<tokenId>", "token id to recover")
  .argument("<recipient>", "Address of the recovery recipient")
  .action(async (address: Address, token: Address, tokenId: string, recipient: Address) => {
    const contract = getDelegationContract(address);
    await recoverERC721(contract, [token, BigInt(tokenId), recipient]);
  });

delegation
  .command("deposit-pause")
  .description("Pauses beacon chain deposits on the staking vault.")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await pauseBeaconChainDeposits(contract);
  });

delegation
  .command("deposit-resume")
  .description("Mass-grants multiple roles to multiple accounts.")
  .argument("<address>", "delegation address")
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await resumeBeaconChainDeposits(contract);
  });

delegation
  .command("role-grant")
  .description("Mass-revokes multiple roles from multiple accounts.")
  .argument("<address>", "delegation address")
  .argument("<roleAssignmentJSON>", "JSON array of role assignments")
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDelegationContract(address);
    await grantRoles(contract, roleAssignmentJSON);
  });

delegation
  .command("role-revoke")
  .description("Resumes beacon chain deposits on the staking vault.")
  .argument("<address>", "delegation address")
  .argument("<roleAssignmentJSON>", "JSON array of role assignments")
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDelegationContract(address);
    await revokeRoles(contract, roleAssignmentJSON);
  });
