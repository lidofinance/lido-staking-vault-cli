import { getDashboardContract, getStakingVaultContract } from 'contracts';
import { Address, Hex } from 'viem';
import { Permit, RoleAssignment } from 'types';
import {
  callReadMethodWithOptions,
  callWriteMethodWithReceipt,
  confirmFund,
  printError,
  stringToBigIntArray,
  jsonToPermit,
  jsonToRoleAssignment,
} from 'utils';

import { dashboard } from './main.js';

// TODO: test without voting
dashboard
  .command('ownership')
  .description('transfers ownership of the staking vault to a new owner')
  .argument('<address>', 'dashboard address')
  .argument('<newOwner>', 'address of the new owner')
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(
      contract,
      'transferStakingVaultOwnership',
      [newOwner],
    );
  });

dashboard
  .command('disconnect')
  .description('disconnects the staking vault from the vault hub')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'voluntaryDisconnect', []);
  });

dashboard
  .command('fund')
  .description('funds the staking vault with ether')
  .option('-a, --address <address>', 'dashboard address')
  .option('-e, --ether <ether>', 'amount of ether to be funded (in WEI)')
  .action(async ({ address, ether }: { address: Address; ether: string }) => {
    const { address: dashboard, amount } = await confirmFund(address, ether);

    if (!dashboard || !amount) return;

    const contract = getDashboardContract(dashboard);

    await callWriteMethodWithReceipt(contract, 'fund', [], BigInt(amount));
  });

dashboard
  .command('fund-weth')
  .description('funds the staking vault with wrapped ether')
  .argument('<address>', 'dashboard address')
  .argument('<wethAmount>', 'amount of weth to be funded')
  .action(async (address: Address, wethAmount: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'fundWeth', [
      BigInt(wethAmount),
    ]);
  });

dashboard
  .command('withdraw')
  .description('withdraws ether from the staking vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<wei>', 'amount of ether to withdraw (in WEI)')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'withdraw', [
      recipient,
      BigInt(ether),
    ]);
  });

dashboard
  .command('withdraw-weth')
  .description('withdraws stETH tokens from the staking vault to wrapped ether')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<ether>', 'amount of ether to withdraw')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'withdrawWETH', [
      recipient,
      BigInt(ether),
    ]);
  });

dashboard
  .command('exit')
  .description('requests the exit of a validator from the staking vault')
  .argument('<address>', 'dashboard address')
  .argument('<validatorPubKey>', 'public key of the validator to exit')
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'requestValidatorExit', [
      validatorPubKey,
    ]);
  });

dashboard
  .command('trigger-validator-withdrawal')
  .description('triggers the withdrawal of a validator from the staking vault')
  .argument('<address>', 'dashboard address')
  .argument('<pubkeys>', 'pubkeys of the validators to withdraw')
  .argument('<amounts>', 'amounts of ether to withdraw', stringToBigIntArray)
  .argument('<recipient>', 'address of the recipient')
  .action(
    async (
      address: Address,
      pubkeys: Hex,
      amounts: bigint[],
      recipient: Address,
    ) => {
      const contract = getDashboardContract(address);

      const vault = await callReadMethodWithOptions(contract, 'stakingVault', {
        onError: (err) => {
          printError(err, 'Error when getting staking vault address');
        },
      });

      const vaultContract = getStakingVaultContract(vault);
      const fee = await callReadMethodWithOptions(
        vaultContract,
        'calculateValidatorWithdrawalFee',
        {
          onError: (err) => {
            printError(err, 'Error when getting validator withdrawal fee');
          },
        },
        [BigInt(amounts.length)],
      );
      if (!fee) {
        return;
      }

      await callWriteMethodWithReceipt(
        contract,
        'triggerValidatorWithdrawal',
        [pubkeys, amounts, recipient],
        fee,
      );
    },
  );

dashboard
  .command('mint-shares')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<amountOfShares>', 'amount of shares to mint')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDashboardContract(address);

      await callWriteMethodWithReceipt(contract, 'mintShares', [
        recipient,
        BigInt(amountOfShares),
      ]);
    },
  );

dashboard
  .command('mint-steth')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<amountOfShares>', 'amount of shares to mint')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDashboardContract(address);

      await callWriteMethodWithReceipt(contract, 'mintStETH', [
        recipient,
        BigInt(amountOfShares),
      ]);
    },
  );

dashboard
  .command('mint-wsteth')
  .description('mints wstETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<tokens>', 'amount of tokens to mint')
  .action(async (address: Address, recipient: Address, tokens: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'mintWstETH', [
      recipient,
      BigInt(tokens),
    ]);
  });

dashboard
  .command('burn-shares')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract',
  )
  .argument('<address>', 'dashboard address')
  .argument('<amountOfShares>', 'amount of shares to burn')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'burnShares', [
      BigInt(amountOfShares),
    ]);
  });

dashboard
  .command('burn-steth')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.',
  )
  .argument('<address>', 'dashboard address')
  .argument('<amountOfShares>', 'amount of shares to burn')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'burnStETH', [
      BigInt(amountOfShares),
    ]);
  });

dashboard
  .command('burn-wsteth')
  .description('burn wstETH tokens from the sender backed by the vault')
  .argument('<address>', 'dashboard address')
  .argument('<tokens>', 'amount of wstETH tokens to burn')
  .action(async (address: Address, tokens: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'burnWstETH', [BigInt(tokens)]);
  });

dashboard
  .command('burn-shares-permit')
  .description(
    'Burns stETH tokens (in shares) backed by the vault from the sender using permit (with value in stETH).',
  )
  .argument('<address>', 'dashboard address')
  .argument('<tokens>', 'amount of stETH tokens to burn')
  .argument(
    '<permitJSON>',
    'JSON data required for the stETH.permit() method to set the allowance',
    jsonToPermit,
  )
  .action(async (address: Address, tokens: string, permit: Permit) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'burnSharesWithPermit', [
      BigInt(tokens),
      permit,
    ]);
  });

dashboard
  .command('burn-steth-permit')
  .description(
    'Burns stETH tokens backed by the vault from the sender using permit.',
  )
  .argument('<address>', 'dashboard address')
  .argument('<tokens>', 'amount of stETH tokens to burn')
  .argument(
    '<permitJSON>',
    'JSON data required for the stETH.permit() method to set the allowance',
    jsonToPermit,
  )
  .action(async (address: Address, tokens: string, permit: Permit) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'burnStETHWithPermit', [
      BigInt(tokens),
      permit,
    ]);
  });

dashboard
  .command('burn-wsteth-permit')
  .description(
    'burn wstETH tokens from the sender backed by the vault using EIP-2612 Permit',
  )
  .argument('<address>', 'dashboard address')
  .argument('<tokens>', 'amount of wstETH tokens to burn')
  .argument(
    '<permitJSON>',
    'JSON data required for the wstETH.permit() method to set the allowance',
    jsonToPermit,
  )
  .action(async (address: Address, tokens: string, permit: Permit) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'burnWstETHWithPermit', [
      BigInt(tokens),
      permit,
    ]);
  });

dashboard
  .command('rebalance')
  .description('rebalance the vault by transferring ether')
  .argument('<address>', 'dashboard address')
  .argument('<ether>', 'amount of ether to rebalance')
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'rebalanceVault', [
      BigInt(ether),
    ]);
  });

dashboard
  .command('recover-erc20')
  .description(
    'recovers ERC20 tokens or ether from the dashboard contract to sender',
  )
  .argument('<address>', 'dashboard address')
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
      const contract = getDashboardContract(address);

      await callWriteMethodWithReceipt(contract, 'recoverERC20', [
        token,
        recipient,
        BigInt(amount),
      ]);
    },
  );

dashboard
  .command('recover-erc721')
  .description(
    'Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)',
  )
  .argument('<address>', 'dashboard address')
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
      const contract = getDashboardContract(address);

      await callWriteMethodWithReceipt(contract, 'recoverERC721', [
        token,
        BigInt(tokenId),
        recipient,
      ]);
    },
  );

dashboard
  .command('deposit-pause')
  .description('Pauses beacon chain deposits on the staking vault.')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'pauseBeaconChainDeposits', []);
  });

dashboard
  .command('deposit-resume')
  .description('Mass-grants multiple roles to multiple accounts.')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(contract, 'resumeBeaconChainDeposits', []);
  });

dashboard
  .command('role-grant')
  .description('Mass-revokes multiple roles from multiple accounts.')
  .argument('<address>', 'dashboard address')
  .argument(
    '<roleAssignmentJSON>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .action(async (address: Address, roleAssignment: RoleAssignment[]) => {
    const contract = getDashboardContract(address);
    if (!Array.isArray(roleAssignment)) {
      throw new Error(
        'the 2nd argument should be an array of role assignments',
      );
    }

    await callWriteMethodWithReceipt(contract, 'grantRoles', [roleAssignment]);
  });

dashboard
  .command('role-revoke')
  .description('Resumes beacon chain deposits on the staking vault.')
  .argument('<address>', 'dashboard address')
  .argument(
    '<roleAssignmentJSON>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .action(async (address: Address, roleAssignment: RoleAssignment[]) => {
    const contract = getDashboardContract(address);
    if (!Array.isArray(roleAssignment)) {
      throw new Error(
        'the 2nd argument should be an array of role assignments',
      );
    }

    await callWriteMethodWithReceipt(contract, 'revokeRoles', [roleAssignment]);
  });

dashboard
  .command('compensate-disproven-predeposit')
  .description(
    'Compensates a disproven predeposit from the Predeposit Guarantee contract.',
  )
  .argument('<address>', 'dashboard address')
  .argument('<pubkey>', 'validator public key')
  .argument('<recipient>', 'address of the recipient')
  .action(async (address: Address, pubkey: Address, recipient: Address) => {
    const contract = getDashboardContract(address);

    await callWriteMethodWithReceipt(
      contract,
      'compensateDisprovenPredepositFromPDG',
      [pubkey, recipient],
    );
  });
