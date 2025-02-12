import { Address } from 'viem';

import { program } from 'command';
import { getDelegationContract, getStakingVaultContract } from 'contracts';
import { Permit, RoleAssignment } from 'types';
import { callWriteMethod, callReadMethod } from 'utils';
import { getBaseInfo } from 'features';

const delegation = program
  .command('delegation')
  .description('delegation contract');

delegation
  .command('roles')
  .description('get delegation contract roles info')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const CURATOR_ROLE = await contract.read.CURATOR_ROLE();
      const NODE_OPERATOR_MANAGER_ROLE =
        await contract.read.NODE_OPERATOR_MANAGER_ROLE();
      const NODE_OPERATOR_FEE_CLAIMER_ROLE =
        await contract.read.NODE_OPERATOR_FEE_CLAIMER_ROLE();
      const FUND_ROLE = await contract.read.FUND_ROLE();
      const WITHDRAW_ROLE = await contract.read.WITHDRAW_ROLE();
      const MINT_ROLE = await contract.read.MINT_ROLE();
      const BURN_ROLE = await contract.read.BURN_ROLE();
      const REBALANCE_ROLE = await contract.read.REBALANCE_ROLE();
      const PAUSE_BEACON_CHAIN_DEPOSITS_ROLE =
        await contract.read.PAUSE_BEACON_CHAIN_DEPOSITS_ROLE();
      const RESUME_BEACON_CHAIN_DEPOSITS_ROLE =
        await contract.read.RESUME_BEACON_CHAIN_DEPOSITS_ROLE();
      const REQUEST_VALIDATOR_EXIT_ROLE =
        await contract.read.REQUEST_VALIDATOR_EXIT_ROLE();
      const VOLUNTARY_DISCONNECT_ROLE =
        await contract.read.VOLUNTARY_DISCONNECT_ROLE();

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
      };

      console.table(Object.entries(payload));
    } catch (err) {
      if (err instanceof Error) {
        console.info('Error when getting roles:\n', err.message);
      }
    }
  });

delegation
  .command('base-info')
  .description('get delegation base info')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    await getBaseInfo(contract);
  });

delegation
  .command('voting-lifetime')
  .description("get committee's voting lifetime period")
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'voteLifetime');
  });

delegation
  .command('is-healthy')
  .description('get vault healthy info')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const valuation = await contract.read.valuation();
      const curatorUnclaimedFee = await contract.read.curatorUnclaimedFee();
      const nodeOperatorUnclaimedFee =
        await contract.read.nodeOperatorUnclaimedFee();
      const minted = await contract.read.sharesMinted();

      const { vault } = await contract.read.vaultSocket();
      const vaultContract = getStakingVaultContract(vault);
      const locked = await vaultContract.read.locked();

      const reserved = locked + curatorUnclaimedFee + nodeOperatorUnclaimedFee;
      const valuationPerc = (valuation / (reserved + minted)) * 100n;
      const isHealthy = valuationPerc >= 100n;

      console.table({
        'Vault Healthy': isHealthy,
        Valuation: valuation,
        'Curator Unclaimed Fee': curatorUnclaimedFee,
        'Node Operator Unclaimed Fee': nodeOperatorUnclaimedFee,
        Minted: minted,
        Reserved: reserved,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.info('Error when getting info:\n', err.message);
      }
    }
  });

delegation
  .command('voting-info')
  .description('get committee votes')
  .argument('<address>', 'delegation contract address')
  .argument('<callId>', 'voting id')
  .argument('<role>', 'role that voted')
  .action(async (address: Address, callId: Address, role: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'votings', [callId, role]);
  });

delegation
  .command('cf')
  .description('Curator fee in basis points')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'curatorFeeBP');
  });

delegation
  .command('cf-report')
  .description(
    'The last report for which curator fee was claimed. Updated on each claim.',
  )
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'curatorFeeClaimedReport');
  });

delegation
  .command('cf-unclaimed')
  .description(
    `Returns the accumulated unclaimed curator fee in ether,
    calculated as: U = (R * F) / T
    where:
    - U is the curator unclaimed fee;
    - R is the StakingVault rewards accrued since the last curator fee claim;
    - F is curatorFeeBP
    - T is the total basis points, 10,000.`,
  )
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'curatorUnclaimedFee');
  });

delegation
  .command('cf-set')
  .description('sets the curator fee')
  .argument('<address>', 'delegation contract address')
  .argument('<newCuratorFee>', 'curator fee in basis points')
  .action(async (address: Address, newCuratorFee: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'setCuratorFeeBP', [BigInt(newCuratorFee)]);
  });

delegation
  .command('cf-claim')
  .description('claims the curator fee')
  .argument('<address>', 'delegation contract address')
  .argument('<recipient>', 'address to which the curator fee will be sent')
  .action(async (address: Address, recipient: Address) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'claimCuratorFee', [recipient]);
  });

delegation
  .command('nof')
  .description('Node operator fee in basis points')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    try {
      const nodeOperatorFeeBP = await contract.read.nodeOperatorFeeBP();
      console.table({ 'Node Operator Fee BP:': nodeOperatorFeeBP });
    } catch (err) {
      if (err instanceof Error) {
        console.info('Error when getting Node Operator Fee BP:\n', err.message);
      }
    }
  });

delegation
  .command('nof-report')
  .description(
    'The last report for which node operator fee was claimed. Updated on each claim.',
  )
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'nodeOperatorFeeClaimedReport');
  });

delegation
  .command('nof-unclaimed')
  .description(
    `Returns the accumulated unclaimed node operator fee in ether,
    calculated as: U = (R * F) / T
    where:
    - U is the node operator unclaimed fee;
    - R is the StakingVault rewards accrued since the last node operator fee claim;
    - F is nodeOperatorFeeBP
    - T is the total basis points, 10,000.`,
  )
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'nodeOperatorUnclaimedFee');
  });

delegation
  .command('nof-set')
  .description('sets the node operator fee')
  .argument('<address>', 'delegation contract address')
  .argument(
    '<newNodeOperatorFeeBP>',
    'The new node operator fee in basis points',
  )
  .action(async (address: Address, newNodeOperatorFeeBP: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'setNodeOperatorFeeBP', [
      BigInt(newNodeOperatorFeeBP),
    ]);
  });

delegation
  .command('nof-claim')
  .description('claims the node operator fee')
  .argument('<address>', 'delegation contract address')
  .argument(
    '<recipient>',
    'address to which the node operator fee will be sent',
  )
  .action(async (address: Address, recipient: Address) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'claimNodeOperatorFee', [recipient]);
  });

delegation
  .command('unreserved')
  .description('returns the unreserved amount of ether')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'unreserved');
  });

delegation
  .command('vc')
  .description('returns the voting committee')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    const committeeList = await callReadMethod(contract, 'votingCommittee');
    const committee = {
      CURATOR_ROLE: committeeList[0],
      NODE_OPERATOR_MANAGER_ROLE: committeeList[1],
    };
    console.table({ committee });
  });

delegation
  .command('fund')
  .description('funds the StakingVault with ether')
  .argument('<address>', 'delegation contract address')
  .argument('<ether>', 'ether to fund')
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'fund', [], BigInt(ether));
  });

delegation
  .command('withdraw')
  .description('withdraws ether from the StakingVault')
  .argument('<address>', 'delegation contract address')
  .argument('<recipient>', 'address to which the ether will be sent')
  .argument('<ether>', 'ether to found')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);
    await callWriteMethod(contract, 'withdraw', [recipient, BigInt(ether)]);
  });

delegation
  .command('rebalance')
  .description('rebalances the StakingVault with a given amount of ether')
  .argument('<address>', 'delegation contract address')
  .argument('<ether>', 'amount of ether to rebalance with')
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'rebalanceVault', [BigInt(ether)]);
  });

delegation
  .command('set-vote-lt')
  .description('sets the vote lifetime')
  .argument('<address>', 'delegation contract address')
  .argument('<newVoteLifetime>', 'new vote lifetime in seconds')
  .action(async (address: Address, newVoteLifetime: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'setVoteLifetime', [
      BigInt(newVoteLifetime),
    ]);
  });

// TODO: test without voting
delegation
  .command('t-ownership')
  .description('transfers the ownership of the StakingVault')
  .argument('<address>', 'delegation contract address')
  .argument('<newOwner>', 'address to which the ownership will be transferred')
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'transferStakingVaultOwnership', [
      newOwner,
    ]);
  });

delegation
  .command('disconnect')
  .description('voluntarily disconnects a StakingVault from VaultHub')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'voluntaryDisconnect', []);
  });

delegation
  .command('deposit-pause')
  .description('Pauses deposits to beacon chain from the StakingVault.')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'pauseBeaconChainDeposits', []);
  });

delegation
  .command('deposit-resume')
  .description('Resumes deposits to beacon chain from the StakingVault.')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'resumeBeaconChainDeposits', []);
  });

delegation
  .command('vault')
  .description('vault info')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'vaultSocket');
  });

delegation
  .command('s-limit')
  .description('shares limit')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'shareLimit');
  });

delegation
  .command('s-minted')
  .description('shares minted')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'sharesMinted');
  });

delegation
  .command('reserve-ratio')
  .description('vault reserve ratio of the vault')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'reserveRatioBP');
  });

delegation
  .command('t-reserve-ratio')
  .description('threshold reserve ratio of the vault')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'thresholdReserveRatioBP');
  });

delegation
  .command('t-fee')
  .description('treasury fee basis points')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'treasuryFee');
  });

delegation
  .command('valuation')
  .description('valuation of the vault in ether')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'valuation');
  });

delegation
  .command('t-shares')
  .description('total of shares that can be minted on the vault')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'totalMintableShares');
  });

delegation
  .command('get-shares')
  .description(
    'maximum number of shares that can be minted with deposited ether',
  )
  .argument('<address>', 'delegation address')
  .argument('<ether>', 'amount of ether to be funded')
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'projectedNewMintableShares', [
      BigInt(ether),
    ]);
  });

delegation
  .command('withdrawable-eth')
  .description('amount of ether that can be withdrawn from the staking vault')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    await callReadMethod(contract, 'withdrawableEther');
  });

delegation
  .command('fund-weth')
  .description('funds the staking vault with wrapped ether')
  .argument('<address>', 'delegation address')
  .argument('<wethAmount>', 'amount of weth to be funded')
  .action(async (address: Address, wethAmount: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'fundWeth', [BigInt(wethAmount)]);
  });

delegation
  .command('withdraw-weth')
  .description('withdraws stETH tokens from the staking vault to wrapped ether')
  .argument('<address>', 'delegation address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<ether>', 'amount of ether to withdraw')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'withdrawWETH', [recipient, BigInt(ether)]);
  });

delegation
  .command('exit')
  .description('requests the exit of a validator from the staking vault')
  .argument('<address>', 'delegation address')
  .argument('<validatorPubKey>', 'public key of the validator to exit')
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'requestValidatorExit', [validatorPubKey]);
  });

delegation
  .command('mint-shares')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'delegation address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<amountOfShares>', 'amount of shares to mint')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDelegationContract(address);

      await callWriteMethod(contract, 'mintShares', [
        recipient,
        BigInt(amountOfShares),
      ]);
    },
  );

delegation
  .command('mint-steth')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'delegation address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<amountOfShares>', 'amount of shares to mint')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDelegationContract(address);

      await callWriteMethod(contract, 'mintStETH', [
        recipient,
        BigInt(amountOfShares),
      ]);
    },
  );

delegation
  .command('mint-wsteth')
  .description('mints wstETH tokens backed by the vault to a recipient')
  .argument('<address>', 'delegation address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<tokens>', 'amount of tokens to mint')
  .action(async (address: Address, recipient: Address, tokens: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'mintWstETH', [recipient, BigInt(tokens)]);
  });

delegation
  .command('burn-shares')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract',
  )
  .argument('<address>', 'delegation address')
  .argument('<amountOfShares>', 'amount of shares to burn')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'burnShares', [BigInt(amountOfShares)]);
  });

delegation
  .command('burn-steth')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.',
  )
  .argument('<address>', 'delegation address')
  .argument('<amountOfShares>', 'amount of shares to burn')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'burnStETH', [BigInt(amountOfShares)]);
  });

delegation
  .command('burn-wsteth')
  .description('burn wstETH tokens from the sender backed by the vault')
  .argument('<address>', 'delegation address')
  .argument('<tokens>', 'amount of wstETH tokens to burn')
  .action(async (address: Address, tokens: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'burnWstETH', [BigInt(tokens)]);
  });

delegation
  .command('burn-shares-permit')
  .description(
    'Burns stETH tokens (in shares) backed by the vault from the sender using permit (with value in stETH).',
  )
  .argument('<address>', 'delegation address')
  .argument('<tokens>', 'amount of stETH tokens to burn')
  .argument(
    '<permitJSON>',
    'JSON data required for the stETH.permit() method to set the allowance',
  )
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'burnSharesWithPermit', [
      BigInt(tokens),
      permit,
    ]);
  });

delegation
  .command('burn-steth-permit')
  .description(
    'Burns stETH tokens backed by the vault from the sender using permit.',
  )
  .argument('<address>', 'delegation address')
  .argument('<tokens>', 'amount of stETH tokens to burn')
  .argument(
    '<permitJSON>',
    'JSON data required for the stETH.permit() method to set the allowance',
  )
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'burnStETHWithPermit', [
      BigInt(tokens),
      permit,
    ]);
  });

delegation
  .command('burn-wsteth-permit')
  .description(
    'burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit',
  )
  .argument('<address>', 'delegation address')
  .argument('<tokens>', 'amount of wstETH tokens to burn')
  .argument(
    '<permitJSON>',
    'JSON data required for the wstETH.permit() method to set the allowance',
  )
  .action(async (address: Address, tokens: string, permitJSON: string) => {
    const permit = JSON.parse(permitJSON) as Permit;
    const contract = getDelegationContract(address);

    await callWriteMethod(contract, 'burnWstETHWithPermit', [
      BigInt(tokens),
      permit,
    ]);
  });

delegation
  .command('recover-erc20')
  .description(
    'recovers ERC20 tokens or ether from the delegation contract to sender',
  )
  .argument('<address>', 'delegation address')
  .argument(
    '<token>',
    'Address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether',
  )
  .argument('<recipient>', 'Address of the recovery recipient')
  .argument('<amount>', 'amount of ether to recover')
  .action(
    async (
      address: Address,
      token: Address,
      recipient: Address,
      amount: string,
    ) => {
      const contract = getDelegationContract(address);

      await callWriteMethod(contract, 'recoverERC20', [
        token,
        recipient,
        BigInt(amount),
      ]);
    },
  );

delegation
  .command('recover-erc721')
  .description(
    'Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)',
  )
  .argument('<address>', 'delegation address')
  .argument('<token>', 'an ERC721-compatible token')
  .argument('<tokenId>', 'token id to recover')
  .argument('<recipient>', 'Address of the recovery recipient')
  .action(
    async (
      address: Address,
      token: Address,
      tokenId: string,
      recipient: Address,
    ) => {
      const contract = getDelegationContract(address);

      await callWriteMethod(contract, 'recoverERC721', [
        token,
        BigInt(tokenId),
        recipient,
      ]);
    },
  );

delegation
  .command('role-grant')
  .description('Mass-revokes multiple roles from multiple accounts.')
  .argument('<address>', 'delegation address')
  .argument('<roleAssignmentJSON>', 'JSON array of role assignments')
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDelegationContract(address);

    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];
    if (!Array.isArray(payload)) {
      throw new Error(
        'the 2nd argument should be an array of role assignments',
      );
    }

    await callWriteMethod(contract, 'grantRoles', [payload]);
  });

delegation
  .command('role-revoke')
  .description('Resumes beacon chain deposits on the staking vault.')
  .argument('<address>', 'delegation address')
  .argument('<roleAssignmentJSON>', 'JSON array of role assignments')
  .action(async (address: Address, roleAssignmentJSON: string) => {
    const contract = getDelegationContract(address);

    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];
    if (!Array.isArray(payload)) {
      throw new Error(
        'the 2nd argument should be an array of role assignments',
      );
    }

    await callWriteMethod(contract, 'revokeRoles', [payload]);
  });
