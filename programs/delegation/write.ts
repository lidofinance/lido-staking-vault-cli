import { Address, parseEther } from 'viem';

import { getDelegationContract } from 'contracts';
import { Permit, RoleAssignment } from 'types';
import {
  callWriteMethodWithReceipt,
  jsonToPermit,
  jsonToRoleAssignment,
  confirmOperation,
  callReadMethod,
  mintShares,
  stringToBigInt,
} from 'utils';

import { delegation } from './main.js';

delegation
  .command('cf-set')
  .description('sets the curator fee')
  .argument('<address>', 'delegation contract address')
  .argument('<newCuratorFee>', 'curator fee in basis points')
  .action(async (address: Address, newCuratorFee: string) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');
    const prevCuratorFee = await callReadMethod(contract, 'curatorFeeBP');

    const confirm = await confirmOperation(
      `Are you sure you want to set the curator fee ${newCuratorFee} (prev: ${prevCuratorFee}) in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'setCuratorFeeBP', [
      BigInt(newCuratorFee),
    ]);
  });

delegation
  .command('cf-claim')
  .description('claims the curator fee')
  .argument('<address>', 'delegation contract address')
  .argument('<recipient>', 'address to which the curator fee will be sent')
  .action(async (address: Address, recipient: Address) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to claim the curator fee in the vault ${vault} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'claimCuratorFee', [recipient]);
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
    const vault = await callReadMethod(contract, 'stakingVault');
    const prevNodeOperatorFee = await callReadMethod(
      contract,
      'nodeOperatorFeeBP',
    );

    const confirm = await confirmOperation(
      `Are you sure you want to set the node operator fee ${newNodeOperatorFeeBP} (prev: ${prevNodeOperatorFee}) in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'setNodeOperatorFeeBP', [
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

    const vault = await callReadMethod(contract, 'stakingVault');
    const confirm = await confirmOperation(
      `Are you sure you want to claim the node operator fee in the vault ${vault} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'claimNodeOperatorFee', [
      recipient,
    ]);
  });

delegation
  .command('fund')
  .description('funds the StakingVault with ether')
  .argument('<address>', 'delegation contract address')
  .argument('<eth>', 'ether to fund (in ETH)')
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to fund the vault ${vault} with ${ether} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'fund', [], parseEther(ether));
  });

delegation
  .command('withdraw')
  .description('withdraws ether from the StakingVault')
  .argument('<address>', 'delegation contract address')
  .argument('<recipient>', 'address to which the ether will be sent')
  .argument('<eth>', 'ether to found (in ETH)')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to withdraw ${ether} ETH from the vault ${vault} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'withdraw', [
      recipient,
      parseEther(ether),
    ]);
  });

delegation
  .command('rebalance')
  .description('rebalances the StakingVault with a given amount of ether')
  .argument('<address>', 'delegation contract address')
  .argument('<ether>', 'amount of ether to rebalance with')
  .action(async (address: Address, ether: string) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to rebalance the vault ${vault} with ${ether} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'rebalanceVault', [
      BigInt(ether),
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
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to transfer the ownership of the vault ${vault} to ${newOwner}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      contract,
      'transferStakingVaultOwnership',
      [newOwner],
    );
  });

delegation
  .command('disconnect')
  .description('voluntarily disconnects a StakingVault from VaultHub')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to voluntarily disconnect the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'voluntaryDisconnect', []);
  });

delegation
  .command('deposit-pause')
  .description('Pauses deposits to beacon chain from the StakingVault.')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to pause deposits to beacon chain from the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'pauseBeaconChainDeposits', []);
  });

delegation
  .command('deposit-resume')
  .description('Resumes deposits to beacon chain from the StakingVault.')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to resume deposits to beacon chain from the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'resumeBeaconChainDeposits', []);
  });

delegation
  .command('fund-weth')
  .description('funds the staking vault with wrapped ether')
  .argument('<address>', 'delegation address')
  .argument('<wethAmount>', 'amount of weth to be funded')
  .action(async (address: Address, wethAmount: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethodWithReceipt(contract, 'fundWeth', [
      BigInt(wethAmount),
    ]);
  });

delegation
  .command('withdraw-weth')
  .description('withdraws stETH tokens from the staking vault to wrapped ether')
  .argument('<address>', 'delegation address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<ether>', 'amount of ether to withdraw')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethodWithReceipt(contract, 'withdrawWETH', [
      recipient,
      BigInt(ether),
    ]);
  });

delegation
  .command('exit')
  .description('requests the exit of a validator from the staking vault')
  .argument('<address>', 'delegation address')
  .argument('<validatorPubKey>', 'public key of the validator to exit')
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to request the exit of the validator ${validatorPubKey} from the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'requestValidatorExit', [
      validatorPubKey,
    ]);
  });

delegation
  .command('mint-shares')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'delegation address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<amountOfShares>', 'amount of shares to mint', stringToBigInt)
  .action(
    async (address: Address, recipient: Address, amountOfShares: bigint) => {
      const contract = getDelegationContract(address);

      await mintShares(contract, recipient, amountOfShares);
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
      const vault = await callReadMethod(contract, 'stakingVault');

      const confirm = await confirmOperation(
        `Are you sure you want to mint ${amountOfShares} stETH to ${recipient} in the vault ${vault}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'mintStETH', [
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

    await callWriteMethodWithReceipt(contract, 'mintWstETH', [
      recipient,
      BigInt(tokens),
    ]);
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
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to burn ${amountOfShares} shares from the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'burnShares', [
      BigInt(amountOfShares),
    ]);
  });

delegation
  .command('burn-steth')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.',
  )
  .argument('<address>', 'delegation address')
  .argument('<amountOfShares>', 'amount of shares to burn', stringToBigInt)
  .action(async (address: Address, amountOfShares: bigint) => {
    const contract = getDelegationContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to burn ${amountOfShares} stETH from the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'burnStETH', [amountOfShares]);
  });

delegation
  .command('burn-wsteth')
  .description('burn wstETH tokens from the sender backed by the vault')
  .argument('<address>', 'delegation address')
  .argument('<tokens>', 'amount of wstETH tokens to burn')
  .action(async (address: Address, tokens: string) => {
    const contract = getDelegationContract(address);

    await callWriteMethodWithReceipt(contract, 'burnWstETH', [BigInt(tokens)]);
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
    jsonToPermit,
  )
  .action(async (address: Address, tokens: string, permit: Permit) => {
    const contract = getDelegationContract(address);

    await callWriteMethodWithReceipt(contract, 'burnSharesWithPermit', [
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
    jsonToPermit,
  )
  .action(async (address: Address, tokens: string, permit: Permit) => {
    const contract = getDelegationContract(address);

    await callWriteMethodWithReceipt(contract, 'burnStETHWithPermit', [
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
    jsonToPermit,
  )
  .action(async (address: Address, tokens: string, permit: Permit) => {
    const contract = getDelegationContract(address);

    await callWriteMethodWithReceipt(contract, 'burnWstETHWithPermit', [
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
      const vault = await callReadMethod(contract, 'stakingVault');

      const confirm = await confirmOperation(
        `Are you sure you want to recover ${amount} ${token} from the vault ${vault} to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'recoverERC20', [
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
      const vault = await callReadMethod(contract, 'stakingVault');

      const confirm = await confirmOperation(
        `Are you sure you want to recover the token ${token} with id ${tokenId} from the vault ${vault} to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'recoverERC721', [
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
  .argument(
    '<roleAssignmentJSON>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .action(async (address: Address, roleAssignment: RoleAssignment[]) => {
    const contract = getDelegationContract(address);

    if (!Array.isArray(roleAssignment)) {
      throw new Error(
        'the 2nd argument should be an array of role assignments',
      );
    }

    const vault = await callReadMethod(contract, 'stakingVault');
    const confirm = await confirmOperation(
      `Are you sure you want to grant the roles ${JSON.stringify(
        roleAssignment,
      )} in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'grantRoles', [roleAssignment]);
  });

delegation
  .command('role-revoke')
  .description('Resumes beacon chain deposits on the staking vault.')
  .argument('<address>', 'delegation address')
  .argument(
    '<roleAssignmentJSON>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .action(async (address: Address, roleAssignment: RoleAssignment[]) => {
    const contract = getDelegationContract(address);

    if (!Array.isArray(roleAssignment)) {
      throw new Error(
        'the 2nd argument should be an array of role assignments',
      );
    }

    const vault = await callReadMethod(contract, 'stakingVault');
    const confirm = await confirmOperation(
      `Are you sure you want to revoke the roles ${JSON.stringify(
        roleAssignment,
      )} in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'revokeRoles', [roleAssignment]);
  });

delegation
  .command('set-confirm-expiry')
  .description('set the confirmation expiry')
  .argument('<address>', 'delegation address')
  .argument('<newConfirmExpiry>', 'new confirmation expiry')
  .action(async (address: Address, newConfirmExpiry: string) => {
    const contract = getDelegationContract(address);

    const vault = await callReadMethod(contract, 'stakingVault');
    const confirm = await confirmOperation(
      `Are you sure you want to set the confirmation expiry to ${newConfirmExpiry} in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'setConfirmExpiry', [
      BigInt(newConfirmExpiry),
    ]);
  });
