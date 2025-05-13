import { Address, Hex, parseEther, formatEther } from 'viem';
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
  parseDepositArray,
  logInfo,
  getCommandsJson,
  stringToAddress,
  mintSteth,
  burnSteth,
  createPDGProof,
  confirmProposal,
  formatBP,
} from 'utils';
import { RoleAssignment, Deposit } from 'types';

import { dashboard } from './main.js';

const dashboardWrite = dashboard
  .command('write')
  .alias('w')
  .description('dashboard write commands');

dashboardWrite.addOption(new Option('-cmd2json'));
dashboardWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(dashboardWrite));
  process.exit();
});

dashboardWrite
  .command('ownership')
  .description('transfers ownership of the staking vault to a new owner')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<newOwner>', 'address of the new owner', stringToAddress)
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to transfer ownership of the staking vault ${vault} to ${newOwner}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'transferStakingVaultOwnership',
      payload: [newOwner],
    });
  });

dashboardWrite
  .command('disconnect')
  .description('disconnects the staking vault from the vault hub')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to disconnect the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'voluntaryDisconnect',
      payload: [],
    });
  });

dashboardWrite
  .command('fund')
  .description('funds the staking vault with ether')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<ether>', 'amount of ether to be funded (in ETH)')
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to fund the staking vault ${vault} with ${ether} ether?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'fund',
      payload: [],
      value: parseEther(ether),
    });
  });

dashboardWrite
  .command('withdraw')
  .description('withdraws ether from the staking vault to a recipient')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<recipient>', 'address of the recipient', stringToAddress)
  .argument('<eth>', 'amount of ether to withdraw (in ETH)')
  .action(async (address: Address, recipient: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to withdraw ${ether} from the staking vault ${vault} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'withdraw',
      payload: [recipient, parseEther(ether)],
    });
  });

dashboardWrite
  .command('lock')
  .description('updates the locked amount of the staking vault')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<lockedAmount>', 'amount of ether to lock')
  .action(async (address: Address, lockedAmount: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to update the locked amount of the staking vault ${vault} to ${lockedAmount}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'lock',
      payload: [parseEther(lockedAmount)],
    });
  });

dashboardWrite
  .command('exit')
  .description('requests the exit of a validator from the staking vault')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<validatorPubKey>', 'public key of the validator to exit')
  .action(async (address: Address, validatorPubKey: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to exit the validator ${validatorPubKey} from the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestValidatorExit',
      payload: [validatorPubKey],
    });
  });

dashboardWrite
  .command('trigger-validator-withdrawal')
  .description('triggers the withdrawal of a validator from the staking vault')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<pubkeys>', 'pubkeys of the validators to withdraw')
  .argument('<amounts>', 'amounts of ether to withdraw', stringToBigIntArray)
  .argument('<recipient>', 'address of the recipient', stringToAddress)
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

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'triggerValidatorWithdrawal',
        payload: [pubkeys, amounts, recipient],
        value: fee,
      });
    },
  );

dashboardWrite
  .command('mint-shares')
  .alias('mint')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<recipient>', 'address of the recipient', stringToAddress)
  .argument('<amountOfShares>', 'amount of shares to mint (in Shares)')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = getDashboardContract(address);

      await mintShares(
        contract,
        recipient,
        parseEther(amountOfShares),
        'mintShares',
      );
    },
  );

dashboardWrite
  .command('mint-steth')
  .description('mints stETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<recipient>', 'address of the recipient', stringToAddress)
  .argument('<amountOfSteth>', 'amount of stETH to mint')
  .action(
    async (address: Address, recipient: Address, amountOfSteth: string) => {
      const contract = getDashboardContract(address);

      await mintSteth(contract, recipient, parseEther(amountOfSteth));
    },
  );

dashboardWrite
  .command('mint-wsteth')
  .description('mints wstETH tokens backed by the vault to a recipient')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<recipient>', 'address of the recipient', stringToAddress)
  .argument('<amountOfWsteth>', 'amount of wstETH to mint')
  .action(
    async (address: Address, recipient: Address, amountOfWsteth: string) => {
      const contract = getDashboardContract(address);

      await mintShares(
        contract,
        recipient,
        parseEther(amountOfWsteth),
        'mintWstETH',
      );
    },
  );

dashboardWrite
  .command('burn-shares')
  .alias('burn')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects corresponding amount of stETH approved to this contract',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<amountOfShares>', 'amount of shares to burn (in Shares)')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    await burnShares(contract, parseEther(amountOfShares), 'burnShares');
  });

dashboardWrite
  .command('burn-steth')
  .description(
    'Burns stETH shares from the sender backed by the vault. Expects stETH amount approved to this contract.',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<amountOfShares>', 'amount of shares to burn (in stETH)')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = getDashboardContract(address);

    await burnSteth(contract, parseEther(amountOfShares));
  });

dashboardWrite
  .command('burn-wsteth')
  .description('burn wstETH tokens from the sender backed by the vault')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<tokens>', 'amount of wstETH tokens to burn (in wstETH)')
  .action(async (address: Address, tokens: string) => {
    const contract = getDashboardContract(address);

    await burnShares(contract, parseEther(tokens), 'burnWstETH');
  });

dashboardWrite
  .command('rebalance')
  .description('rebalance the vault by transferring ether')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<ether>', 'amount of ether to rebalance (in ETH)')
  .action(async (address: Address, ether: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to rebalance the vault ${vault} with ${ether} ether?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalanceVault',
      payload: [parseEther(ether)],
    });
  });

dashboardWrite
  .command('recover-erc20')
  .description(
    'recovers ERC20 tokens or ether from the dashboard contract to sender',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<token>',
    'Address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether',
  )
  .argument('<recipient>', 'Address of the recovery recipient', stringToAddress)
  .argument('<amount>', 'amount of ether to recover (in ETH)')
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

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'recoverERC20',
        payload: [token, recipient, parseEther(amount)],
      });
    },
  );

dashboardWrite
  .command('recover-erc721')
  .description(
    'Transfers a given token_id of an ERC721-compatible NFT (defined by the token contract address)',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<token>', 'an ERC721-compatible token')
  .argument('<tokenId>', 'token id to recover')
  .argument('<recipient>', 'Address of the recovery recipient', stringToAddress)
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

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'recoverERC721',
        payload: [token, BigInt(tokenId), recipient],
      });
    },
  );

dashboardWrite
  .command('deposit-pause')
  .description('Pauses beacon chain deposits on the staking vault.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to pause beacon chain deposits on the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pauseBeaconChainDeposits',
      payload: [],
    });
  });

dashboardWrite
  .command('deposit-resume')
  .description('Mass-grants multiple roles to multiple accounts.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to resume beacon chain deposits on the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resumeBeaconChainDeposits',
      payload: [],
    });
  });

dashboardWrite
  .command('role-grant')
  .description('Mass-revokes multiple roles from multiple accounts.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<roleAssignmentJSON>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .addHelpText(
    'after',
    `Role assignment format:
    [{
      "account": "...",
      "role": "..."
    }
    {second role assignment}
    ...]`,
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
      `Are you sure you want to grant the roles ${roleAssignment.map((i) =>
        JSON.stringify(i),
      )} in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'grantRoles',
      payload: [roleAssignment],
    });
  });

dashboardWrite
  .command('role-revoke')
  .description('Resumes beacon chain deposits on the staking vault.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<roleAssignmentJSON>',
    'JSON array of role assignments',
    jsonToRoleAssignment,
  )
  .addHelpText(
    'after',
    `Role assignment format:
    [{
      "account": "...",
      "role": "..."
    }
    {second role assignment}
    ...]`,
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
      `Are you sure you want to revoke the roles ${roleAssignment.map((i) =>
        JSON.stringify(i),
      )} in the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'revokeRoles',
      payload: [roleAssignment],
    });
  });

dashboardWrite
  .command('compensate-disproven-predeposit')
  .alias('compensate')
  .description(
    'Compensates ether of disproven validator`s predeposit from PDG to the recipient',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<pubkey>', 'validator that was proven invalid in PDG')
  .argument(
    '<recipient>',
    'address to receive the `PDG.PREDEPOSIT_AMOUNT`',
    stringToAddress,
  )
  .action(async (address: Address, pubkey: Address, recipient: Address) => {
    const contract = getDashboardContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to compensate the disproven predeposit from the Predeposit Guarantee contract ${contract} with validator public key ${pubkey} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'compensateDisprovenPredepositFromPDG',
      payload: [pubkey, recipient],
    });
  });

dashboardWrite
  .command('unguaranteed-deposit-to-beacon-chain')
  .alias('unguaranteed-deposit')
  .description(
    'Withdraws ether from vault and deposits directly to provided validators bypassing the default PDG process',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<deposits>',
    'array of IStakingVault.Deposit structs containing deposit data',
    parseDepositArray,
  )
  .addHelpText(
    'after',
    `Deposit format:
    '{
      "pubkey": "...",
      "signature": "...",
      "amount": "...",
      "deposit_data_root": "..."
    }
    {second deposit}
    ...'`,
  )
  .action(async (address: Address, deposits: Deposit[]) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to unguaranteed deposit ${deposits.length} deposits to the beacon chain in the staking vault ${vault}?
      Deposits: ${JSON.stringify(deposits)}`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'unguaranteedDepositToBeaconChain',
      payload: [deposits],
    });
  });

dashboardWrite
  .command('prove-unknown-validators-to-pdg')
  .alias('prove-unknown-validators')
  .description(
    'Proves validators with correct vault WC if they are unknown to PDG',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<validatorIndex...>', 'index of the validator to prove')
  .action(async (address: Address, validatorIndexes: string[]) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');
    const vaultContract = getStakingVaultContract(vault);
    const pdgContract = await callReadMethod(vaultContract, 'depositor');

    for (const validatorIndex of validatorIndexes) {
      const packageProof = await createPDGProof(Number(validatorIndex));
      const { proof, pubkey, childBlockTimestamp } = packageProof;

      const confirm = await confirmOperation(
        `Are you sure you want to prove ${proof.length} validators to the Predeposit Guarantee contract ${pdgContract} in the staking vault ${vault}?
      Witnesses: ${JSON.stringify(proof)}`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'proveUnknownValidatorsToPDG',
        payload: [
          [
            {
              proof,
              pubkey,
              validatorIndex: BigInt(validatorIndex),
              childBlockTimestamp,
            },
          ],
        ],
      });
    }
  });

dashboardWrite
  .command('authorize-lido-vault-hub')
  .alias('authorize-hub')
  .description('Authorizes the Lido Vault Hub to manage the staking vault.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to authorize the Lido Vault Hub to manage the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'authorizeLidoVaultHub',
      payload: [],
    });
  });

dashboardWrite
  .command('deauthorize-lido-vault-hub')
  .alias('deauthorize-hub')
  .description(
    'Deauthorizes the Lido Vault Hub from managing the staking vault.',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to deauthorize the Lido Vault Hub from managing the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'deauthorizeLidoVaultHub',
      payload: [],
    });
  });

dashboardWrite
  .command('ossify-staking-vault')
  .alias('ossify')
  .description('Ossifies the staking vault.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to ossify the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'ossifyStakingVault',
      payload: [],
    });
  });

dashboardWrite
  .command('set-depositor')
  .description('Updates the address of the depositor for the staking vault.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<depositor>', 'address of the new depositor')
  .action(async (address: Address, depositor: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to set the depositor of the staking vault ${vault} to ${depositor}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setDepositor',
      payload: [depositor],
    });
  });

dashboardWrite
  .command('reset-locked')
  .description('Zeroes the locked amount of the staking vault.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to reset the locked amount of the staking vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resetLocked',
      payload: [],
    });
  });

dashboardWrite
  .command('request-tier-change')
  .description('Requests a change of tier on the OperatorGrid.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<tier>', 'tier to change to', stringToBigInt)
  .action(async (address: Address, tier: bigint) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to request a change of tier on the OperatorGrid for the staking vault ${vault} to ${tier}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestTierChange',
      payload: [tier],
    });
  });

dashboardWrite
  .command('increase-accrued-rewards-adjustment')
  .description('Increases the accrued rewards adjustment.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<amount>',
    'amount to increase the accrued rewards adjustment by (in ETH)',
  )
  .action(async (address: Address, amount: string) => {
    const contract = getDashboardContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to increase the accrued rewards adjustment by ${amount} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'increaseAccruedRewardsAdjustment',
      payload: [parseEther(amount)],
    });
  });

dashboardWrite
  .command('set-accrued-rewards-adjustment')
  .description('Sets the accrued rewards adjustment.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<amount>',
    'amount to set the accrued rewards adjustment to (in ETH)',
  )
  .action(async (address: Address, amount: string) => {
    const contract = getDashboardContract(address);
    const currentAdjustment = await callReadMethod(
      contract,
      'accruedRewardsAdjustment',
    );

    const confirm = await confirmOperation(
      `Are you sure you want to set the accrued rewards adjustment to ${amount}?
      Current adjustment: ${formatEther(currentAdjustment)} ETH`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setAccruedRewardsAdjustment',
      payload: [parseEther(amount), currentAdjustment],
    });
  });

dashboardWrite
  .command('confirm-proposal')
  .description('Confirms a proposal')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const log = await confirmProposal(address);

    if (!log) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: log.decodedData.functionName as any,
      payload: log.decodedData.args as any,
    });
  });

dashboardWrite
  .command('set-confirm-expiry')
  .description('Sets the confirm expiry')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<expiry>', 'expiry in seconds', stringToBigInt)
  .action(async (address: Address, expiry: bigint) => {
    const contract = getDashboardContract(address);

    const hours = Number(expiry) / 3600;
    const confirm = await confirmOperation(
      `Are you sure you want to set the confirm expiry to ${expiry} seconds (${hours} hours)?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setConfirmExpiry',
      payload: [expiry],
    });
  });

dashboardWrite
  .command('set-node-operator-fee')
  .description('Sets the node operator fee')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<fee>',
    'the new node operator fee in basis points',
    stringToBigInt,
  )
  .action(async (address: Address, fee: bigint) => {
    const contract = getDashboardContract(address);

    const percentage = formatBP(fee);
    const confirm = await confirmOperation(
      `Are you sure you want to set the node operator fee ${fee} in basis points (${percentage})?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setNodeOperatorFeeBP',
      payload: [fee],
    });
  });
