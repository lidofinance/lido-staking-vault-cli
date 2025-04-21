import { Address, Hex, parseEther } from 'viem';
import { Option } from 'commander';

import { getDashboardContract, getStakingVaultContract } from 'contracts';
import {
  callReadMethod,
  callWriteMethodWithReceipt,
  stringToBigIntArray,
  jsonToRoleAssignment,
  confirmOperation,
  stringToBigInt,
  mintShares,
  burnShares,
  Deposit,
  parseDepositArray,
  ValidatorWitness,
  logInfo,
  getCommandsJson,
} from 'utils';
import { RoleAssignment } from 'types';

import { dashboard } from './main.js';

const dashboardWrite = dashboard
  .command('write')
  .alias('w')
  .description('write commands');

dashboardWrite.addOption(new Option('-cmd2json'));
dashboardWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboardWrite));
  process.exit();
});

dashboardWrite
  .command('ownership')
  .description('transfers ownership of the staking vault to a new owner')
  .argument('<address>', 'dashboard address')
  .argument('<newOwner>', 'address of the new owner')
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to transfer ownership of the staking vault ${vault} to ${newOwner}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      contract,
      'transferStakingVaultOwnership',
      [newOwner],
    );
  });

dashboardWrite
  .command('disconnect')
  .description('disconnects the staking vault from the vault hub')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to disconnect the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'voluntaryDisconnect', []);
  });

dashboardWrite
  .command('fund')
  .description('funds the staking vault with ether')
  .argument('<address>', 'dashboard address')
  .argument('<ether>', 'amount of ether to be funded (in ETH)')
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to fund the staking vault ${vault} with ${ether} ether?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'fund', [], parseEther(ether));
  });

dashboardWrite
  .command('withdraw')
  .description('withdraws ether from the staking vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<eth>', 'amount of ether to withdraw (in ETH)')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to withdraw ${ether} from the staking vault ${vault} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'withdraw', [
      recipient,
      parseEther(ether),
    ]);
  });

dashboardWrite
  .command('lock')
  .description('updates the locked amount of the staking vault')
  .argument('<address>', 'dashboard address')
  .argument('<lockedAmount>', 'amount of ether to lock')
  .action(async (address: Address, lockedAmount: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to update the locked amount of the staking vault ${vault} to ${lockedAmount}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'lock', [
      parseEther(lockedAmount),
    ]);
  });

dashboardWrite
  .command('exit')
  .description('requests the exit of a validator from the staking vault')
  .argument('<address>', 'dashboard address')
  .argument('<validatorPubKey>', 'public key of the validator to exit')
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to exit the validator ${validatorPubKey} from the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'requestValidatorExit', [
      validatorPubKey,
    ]);
  });

dashboardWrite
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

      const vault = await callReadMethod(contract, 'stakingVault');
      const vaultContract = getStakingVaultContract(vault);
      const fee = await callReadMethod(
        vaultContract,
        'calculateValidatorWithdrawalFee',
        [BigInt(amounts.length)],
      );

      const confirm = await confirmOperation(
        `Are you sure you want to trigger the withdrawal of the validators ${pubkeys} from the staking vault ${vault} to ${recipient} with amounts ${amounts}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(
        contract,
        'triggerValidatorWithdrawal',
        [pubkeys, amounts, recipient],
        fee,
      );
    },
  );

dashboardWrite
  .command('mint-shares')
  .alias('mint')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<amountOfShares>', 'amount of shares to mint', stringToBigInt)
  .action(
    async (address: Address, recipient: Address, amountOfShares: bigint) => {
      const contract = getDashboardContract(address);

      await mintShares(contract, recipient, amountOfShares);
    },
  );

dashboardWrite
  .command('mint-steth')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<amountOfShares>', 'amount of shares to mint')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDashboardContract(address);
      const vault = await callReadMethod(contract, 'stakingVault');

      const confirm = await confirmOperation(
        `Are you sure you want to mint ${amountOfShares} stETH to ${recipient} in the staking vault ${vault}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'mintStETH', [
        recipient,
        BigInt(amountOfShares),
      ]);
    },
  );

dashboardWrite
  .command('mint-wsteth')
  .description('mints wstETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address')
  .argument('<recipient>', 'address of the recipient')
  .argument('<tokens>', 'amount of tokens to mint')
  .action(async (address: Address, recipient: Address, tokens: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to mint ${tokens} wstETH to ${recipient} in the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'mintWstETH', [
      recipient,
      BigInt(tokens),
    ]);
  });

dashboardWrite
  .command('burn-shares')
  .alias('burn')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract',
  )
  .argument('<address>', 'dashboard address')
  .argument('<amountOfShares>', 'amount of shares to burn', stringToBigInt)
  .action(async (address: Address, amountOfShares: bigint) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to burn ${amountOfShares} stETH shares in the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await burnShares(contract, amountOfShares);
  });

dashboardWrite
  .command('burn-steth')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.',
  )
  .argument('<address>', 'dashboard address')
  .argument('<amountOfShares>', 'amount of shares to burn')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to burn ${amountOfShares} stETH in the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'burnStETH', [
      BigInt(amountOfShares),
    ]);
  });

dashboardWrite
  .command('burn-wsteth')
  .description('burn wstETH tokens from the sender backed by the vault')
  .argument('<address>', 'dashboard address')
  .argument('<tokens>', 'amount of wstETH tokens to burn')
  .action(async (address: Address, tokens: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to burn ${tokens} wstETH in the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'burnWstETH', [BigInt(tokens)]);
  });

dashboardWrite
  .command('rebalance')
  .description('rebalance the vault by transferring ether')
  .argument('<address>', 'dashboard address')
  .argument('<ether>', 'amount of ether to rebalance')
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to rebalance the vault ${vault} with ${ether} ether?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'rebalanceVault', [
      BigInt(ether),
    ]);
  });

dashboardWrite
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

      const confirm = await confirmOperation(
        `Are you sure you want to recover ${amount} ${token} from the dashboard contract ${address} to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'recoverERC20', [
        token,
        recipient,
        BigInt(amount),
      ]);
    },
  );

dashboardWrite
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

      const confirm = await confirmOperation(
        `Are you sure you want to recover the token ${token} with id ${tokenId} from the dashboard contract ${address} to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt(contract, 'recoverERC721', [
        token,
        BigInt(tokenId),
        recipient,
      ]);
    },
  );

dashboardWrite
  .command('deposit-pause')
  .description('Pauses beacon chain deposits on the staking vault.')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to pause beacon chain deposits on the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'pauseBeaconChainDeposits', []);
  });

dashboardWrite
  .command('deposit-resume')
  .description('Mass-grants multiple roles to multiple accounts.')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to resume beacon chain deposits on the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'resumeBeaconChainDeposits', []);
  });

dashboardWrite
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

    const vault = await callReadMethod(contract, 'stakingVault');
    const confirm = await confirmOperation(
      `Are you sure you want to grant the roles ${roleAssignment} in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'grantRoles', [roleAssignment]);
  });

dashboardWrite
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

    const vault = await callReadMethod(contract, 'stakingVault');
    const confirm = await confirmOperation(
      `Are you sure you want to revoke the roles ${roleAssignment} in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'revokeRoles', [roleAssignment]);
  });

dashboardWrite
  .command('compensate-disproven-predeposit')
  .alias('compensate')
  .description(
    'Compensates ether of disproven validator`s predeposit from PDG to the recipient',
  )
  .argument('<address>', 'dashboard address')
  .argument('<pubkey>', 'validator that was proven invalid in PDG')
  .argument('<recipient>', 'address to receive the `PDG.PREDEPOSIT_AMOUNT`')
  .action(async (address: Address, pubkey: Address, recipient: Address) => {
    const contract = getDashboardContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to compensate the disproven predeposit from the Predeposit Guarantee contract ${contract} with validator public key ${pubkey} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      contract,
      'compensateDisprovenPredepositFromPDG',
      [pubkey, recipient],
    );
  });

dashboardWrite
  .command('unguaranteed-deposit-to-beacon-chain')
  .alias('unguaranteed-deposit')
  .description(
    'Withdraws ether from vault and deposits directly to provided validators bypassing the default PDG process',
  )
  .argument('<address>', 'dashboard address')
  .argument(
    '<deposits>',
    'array of IStakingVault.Deposit structs containing deposit data',
    parseDepositArray,
  )
  .action(async (address: Address, deposits: Deposit[]) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to unguaranteed deposit ${deposits.length} deposits to the beacon chain in the staking vault ${vault}?
      Deposits: ${JSON.stringify(deposits)}`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(
      contract,
      'unguaranteedDepositToBeaconChain',
      [deposits],
    );
  });

dashboardWrite
  .command('prove-unknown-validators-to-pdg')
  .alias('prove-unknown-validators')
  .description(
    'Proves validators with correct vault WC if they are unknown to PDG',
  )
  .argument('<address>', 'dashboard address')
  .argument(
    '<witnesses>',
    'array of IPredepositGuarantee.ValidatorWitness structs containing proof data for validators',
    parseDepositArray,
  )
  .action(async (address: Address, witnesses: ValidatorWitness[]) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');
    const vaultContract = getStakingVaultContract(vault);
    const pdgContract = await callReadMethod(vaultContract, 'depositor');

    const confirm = await confirmOperation(
      `Are you sure you want to prove ${witnesses.length} validators to the Predeposit Guarantee contract ${pdgContract} in the staking vault ${vault}?
      Witnesses: ${JSON.stringify(witnesses)}`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'proveUnknownValidatorsToPDG', [
      witnesses,
    ]);
  });

dashboardWrite
  .command('authorize-lido-vault-hub')
  .alias('authorize-hub')
  .description('Authorizes the Lido Vault Hub to manage the staking vault.')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to authorize the Lido Vault Hub to manage the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'authorizeLidoVaultHub', []);
  });

dashboardWrite
  .command('deauthorize-lido-vault-hub')
  .alias('deauthorize-hub')
  .description(
    'Deauthorizes the Lido Vault Hub from managing the staking vault.',
  )
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to deauthorize the Lido Vault Hub from managing the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'deauthorizeLidoVaultHub', []);
  });

dashboardWrite
  .command('ossify-staking-vault')
  .alias('ossify')
  .description('Ossifies the staking vault.')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to ossify the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'ossifyStakingVault', []);
  });

dashboardWrite
  .command('set-depositor')
  .description('Updates the address of the depositor for the staking vault.')
  .argument('<address>', 'dashboard address')
  .argument('<depositor>', 'address of the new depositor')
  .action(async (address: Address, depositor: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to set the depositor of the staking vault ${vault} to ${depositor}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'setDepositor', [depositor]);
  });

dashboardWrite
  .command('reset-locked')
  .description('Zeroes the locked amount of the staking vault.')
  .argument('<address>', 'dashboard address')
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to reset the locked amount of the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'resetLocked', []);
  });

dashboardWrite
  .command('request-tier-change')
  .description('Requests a change of tier on the OperatorGrid.')
  .argument('<address>', 'dashboard address')
  .argument('<tier>', 'tier to change to', stringToBigInt)
  .action(async (address: Address, tier: bigint) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to request a change of tier on the OperatorGrid for the staking vault ${vault} to ${tier}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt(contract, 'requestTierChange', [tier]);
  });
