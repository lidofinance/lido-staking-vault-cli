import { Address, Hex, parseEther, formatEther } from 'viem';
import { Option } from 'commander';

import { getAccount } from 'providers';
import {
  getDashboardContract,
  getOperatorGridContract,
  getStakingVaultContract,
} from 'contracts';
import {
  mintShares,
  burnShares,
  mintSteth,
  burnSteth,
  checkIsReportFresh,
} from 'features';
import {
  callReadMethod,
  callWriteMethodWithReceipt,
  jsonToRoleAssignment,
  confirmOperation,
  stringToBigInt,
  parseDepositArray,
  logInfo,
  getCommandsJson,
  stringToAddress,
  createPDGProof,
  confirmProposal,
  formatBP,
  callReadMethodSilent,
  showSpinner,
  stringToBigIntArrayWei,
  stringToHexArray,
  etherToWei,
  type ValidatorWitness,
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
  .command('transfer-vault-ownership')
  .alias('ownership')
  .description(
    'transfers the ownership of the underlying StakingVault from this contract to a new owner without disconnecting it from the hub',
  )
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
      methodName: 'transferVaultOwnership',
      payload: [newOwner],
    });
  });

dashboardWrite
  .command('voluntary-disconnect')
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

    const isReportFresh = await checkIsReportFresh(vault);
    if (!isReportFresh) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'withdraw',
      payload: [recipient, parseEther(ether)],
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
  .argument(
    '<pubkeys>',
    'pubkeys of the validators to withdraw. Comma separated list of pubkeys',
    stringToHexArray,
  )
  .argument(
    '<amounts>',
    'amounts of ether to withdraw. Comma separated list of amounts',
    stringToBigIntArrayWei,
  )
  .argument('<recipient>', 'address of the recipient', stringToAddress)
  .action(
    async (
      address: Address,
      pubkeys: Hex[],
      amounts: bigint[],
      recipient: Address,
    ) => {
      const mergedPubkeys: Hex = pubkeys.join('') as Hex;

      const contract = getDashboardContract(address);
      const vault = await callReadMethod(contract, 'stakingVault');
      const vaultContract = getStakingVaultContract(vault);
      const fee = await callReadMethod(
        vaultContract,
        'calculateValidatorWithdrawalFee',
        [BigInt(amounts.length)],
      );

      const confirmationMessage = `Are you sure you want to trigger the withdrawal of the validators 
      ${pubkeys.join(', ')} 
      from the staking vault ${vault} to ${recipient} 
      with amounts ${amounts.map((amount) => formatEther(amount)).join(', ')} ETH?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const gweiAmounts = amounts.map((amount) =>
        parseEther(formatEther(amount), 'gwei'),
      );

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'triggerValidatorWithdrawals',
        payload: [mergedPubkeys, gweiAmounts, recipient],
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
      const vault = await callReadMethod(contract, 'stakingVault');

      await mintShares(
        contract,
        recipient,
        parseEther(amountOfShares),
        vault,
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
      const vault = await callReadMethod(contract, 'stakingVault');

      await mintSteth(contract, recipient, parseEther(amountOfSteth), vault);
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
      const vault = await callReadMethod(contract, 'stakingVault');

      await mintShares(
        contract,
        recipient,
        parseEther(amountOfWsteth),
        vault,
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
    const vault = await callReadMethod(contract, 'stakingVault');

    await burnShares(contract, parseEther(amountOfShares), vault, 'burnShares');
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
    const vault = await callReadMethod(contract, 'stakingVault');

    await burnSteth(contract, parseEther(amountOfShares), vault);
  });

dashboardWrite
  .command('burn-wsteth')
  .description('burn wstETH tokens from the sender backed by the vault')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<tokens>', 'amount of wstETH tokens to burn (in wstETH)')
  .action(async (address: Address, tokens: string) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    await burnShares(contract, parseEther(tokens), vault, 'burnWstETH');
  });

dashboardWrite
  .command('rebalance-ether')
  .description('rebalance the vault by transferring ether')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<ether>', 'amount of ether to rebalance (in ETH)', etherToWei)
  .action(async (address: Address, ether: bigint) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to rebalance the vault ${vault} with ${formatEther(ether)} ether by transferring?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalanceVaultWithEther',
      payload: [ether],
      value: ether,
    });
  });

dashboardWrite
  .command('rebalance-shares')
  .description('rebalance the vault by transferring shares')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<shares>', 'amount of shares to rebalance (in shares)', etherToWei)
  .action(async (address: Address, shares: bigint) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to rebalance the vault ${vault} with ${formatEther(shares)} shares?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalanceVaultWithShares',
      payload: [shares],
    });
  });

dashboardWrite
  .command('recover-erc20')
  .description(
    'recovers ERC20 tokens or ether from the dashboard contract to the recipient',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<token>',
    'address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether (EIP-7528)',
    stringToAddress,
  )
  .argument(
    '<amount>',
    'amount of tokens or ether to recover (in ETH)',
    etherToWei,
  )
  .argument('<recipient>', 'address of the recovery recipient', stringToAddress)
  .action(
    async (
      address: Address,
      token: Address,
      amount: bigint,
      recipient: Address,
    ) => {
      const contract = getDashboardContract(address);

      const confirm = await confirmOperation(
        `Are you sure you want to recover the token ${token} with amount ${formatEther(amount)} from the dashboard contract ${address} to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'recoverERC20',
        payload: [token, recipient, amount],
      });
    },
  );

dashboardWrite
  .command('collect-erc20-from-vault')
  .description(
    'collects ERC20 tokens from vault contract balance to the recipient',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<token>',
    'address of the token to recover or 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee for ether (EIP-7528)',
    stringToAddress,
  )
  .argument(
    '<amount>',
    'amount of tokens or ether to recover (in ETH)',
    etherToWei,
  )
  .argument('<recipient>', 'address of the recovery recipient', stringToAddress)
  .action(
    async (
      address: Address,
      token: Address,
      amount: bigint,
      recipient: Address,
    ) => {
      const contract = getDashboardContract(address);

      const confirm = await confirmOperation(
        `Are you sure you want to recover the token ${token} with amount ${formatEther(amount)} from the dashboard contract ${address} to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'collectERC20FromVault',
        payload: [token, recipient, amount],
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
  .description('resumes deposits to beacon chain')
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
  .description('mass-grants multiple roles to multiple accounts.')
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
  .description('mass-revokes multiple roles from multiple accounts')
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
  .command('unguaranteed-deposit-to-beacon-chain')
  .alias('unguaranteed-deposit')
  .description(
    'withdraws ether from vault and deposits directly to provided validators bypassing the default PDG process',
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
    '[{
      "pubkey": "...",
      "signature": "...",
      "amount": "...",
      "deposit_data_root": "..."
    }
    {second deposit}
    ...]'`,
  )
  .action(async (address: Address, deposits: Deposit[]) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to unguaranteed deposit ${deposits.length} deposits to the beacon chain in the staking vault ${vault}?
      Pubkeys: ${deposits.map((i) => i.pubkey).join(', ')}`,
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
    'proves validators with correct vault WC if they are unknown to PDG',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<validatorIndex...>', 'index of the validator to prove')
  .action(async (address: Address, validatorIndexes: string[]) => {
    const account = await getAccount();
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');
    const vaultContract = getStakingVaultContract(vault);
    const pdgContract = await callReadMethodSilent(vaultContract, 'depositor');

    const payload: ValidatorWitness[] = [];

    const PDG_PROVE_VALIDATOR_ROLE = await callReadMethodSilent(
      contract,
      'PDG_PROVE_VALIDATOR_ROLE',
    );
    const hasRole = await callReadMethodSilent(contract, 'hasRole', [
      PDG_PROVE_VALIDATOR_ROLE,
      account.address,
    ]);

    if (!hasRole) {
      throw new Error(
        `You do not have role (PDG_PROVE_VALIDATOR_ROLE - ${PDG_PROVE_VALIDATOR_ROLE}) to prove validators to PDG`,
      );
    }

    for (const validatorIndex of validatorIndexes) {
      const hideSpinner = showSpinner({
        type: 'bouncingBar',
        message: `Making proof for validator ${validatorIndex}...`,
      });
      const packageProof = await createPDGProof(Number(validatorIndex));
      const { proof, pubkey, childBlockTimestamp, slot, proposerIndex } =
        packageProof;
      hideSpinner();

      const confirm = await confirmOperation(
        `Are you sure you want to prove ${pubkey} validator (${validatorIndex}) to the Predeposit Guarantee contract ${pdgContract} in the staking vault ${vault}?
      Witnesses length: ${proof.length}`,
      );
      if (!confirm) return;

      const proofItem = {
        proof,
        pubkey,
        validatorIndex: BigInt(validatorIndex),
        childBlockTimestamp,
        slot,
        proposerIndex,
      };
      payload.push(proofItem);
    }

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'proveUnknownValidatorsToPDG',
      payload: [payload],
    });
  });

dashboardWrite
  .command('abandon-dashboard')
  .alias('abandon')
  .description(
    'accepts the ownership over the StakingVault transferred from VaultHub on disconnect and immediately transfers it to a new pending owner. This new owner will have to accept the ownership on the StakingVault contract',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<newOwner>', 'new owner address', stringToAddress)
  .action(async (address: Address, newOwner: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to abandon the dashboard ${address} (vault: ${vault})?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'abandonDashboard',
      payload: [newOwner],
    });
  });

dashboardWrite
  .command('connect-to-vault-hub')
  .alias('connect-hub')
  .description('connects to VaultHub, transferring ownership to VaultHub.')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to connect the dashboard ${address} (vault: ${vault}) to VaultHub?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'connectToVaultHub',
      payload: [],
    });
  });

dashboardWrite
  .command('reconnect-to-vault-hub')
  .alias('reconnect-hub')
  .description(
    'accepts the ownership over the StakingVault and connects to VaultHub. Can be called to reconnect to the hub after voluntaryDisconnect()',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to reconnect the dashboard ${address} (vault: ${vault}) to VaultHub?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'reconnectToVaultHub',
      payload: [],
    });
  });

dashboardWrite
  .command('connect-and-accept-tier')
  .alias('connect-and-accept')
  .description('changes the tier of the vault and connects to VaultHub')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<tier>', 'tier to change to', stringToBigInt)
  .argument(
    '<requestedShareLimit>',
    'requested new share limit for the vault (in shares)',
    etherToWei,
  )
  .option('-f, --fund', 'optional fund the vault with 1 ETH', false)
  .action(
    async (
      address: Address,
      tier: bigint,
      requestedShareLimit: bigint,
      { fund }: { fund: boolean },
    ) => {
      const contract = getDashboardContract(address);
      const vault = await callReadMethod(contract, 'stakingVault');

      const confirm = await confirmOperation(
        `Are you sure you want to change the tier of the vault ${vault} to ${tier} and connect to VaultHub?
        Requested share limit: ${formatEther(requestedShareLimit)}`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'connectAndAcceptTier',
        payload: [tier, requestedShareLimit],
        value: fund ? parseEther('1') : undefined,
      });
    },
  );

dashboardWrite
  .command('increase-rewards-adjustment')
  .description(
    'increases rewards adjustment to correct fee calculation due to non-rewards ether on CL',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<amount>',
    'amount to increase the rewards adjustment by (in ETH)',
    etherToWei,
  )
  .action(async (address: Address, amount: bigint) => {
    const contract = getDashboardContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to increase the rewards adjustment by ${formatEther(amount)} ETH?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'increaseRewardsAdjustment',
      payload: [amount],
    });
  });

dashboardWrite
  .command('set-rewards-adjustment')
  .description(
    'set `rewardsAdjustment` to a new proposed value if `confirmingRoles()` agree',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<amount>',
    'amount to set the accrued rewards adjustment to (in ETH)',
    etherToWei,
  )
  .action(async (address: Address, amount: bigint) => {
    const contract = getDashboardContract(address);
    const currentAdjustment = await callReadMethod(
      contract,
      'rewardsAdjustment',
    );

    const confirm = await confirmOperation(
      `Are you sure you want to set the rewards adjustment to ${formatEther(amount)} ETH?
      Current adjustment: ${formatEther(currentAdjustment[0])} ETH`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setRewardsAdjustment',
      payload: [amount, currentAdjustment[0]],
    });
  });

dashboardWrite
  .command('set-node-operator-fee-recipient')
  .alias('set-no-f-r')
  .description('sets the node operator fee recipient')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<recipient>',
    'address of the new node operator fee recipient',
    stringToAddress,
  )
  .action(async (address: Address, recipient: Address) => {
    const contract = getDashboardContract(address);

    const confirm = await confirmOperation(
      `Are you sure you want to set the node operator fee recipient to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setNodeOperatorFeeRecipient',
      payload: [recipient],
    });
  });

dashboardWrite
  .command('confirm-proposal')
  .description('Confirms a proposal')
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethodSilent(contract, 'stakingVault');
    const operatorGridContract = await getOperatorGridContract();
    const log = await confirmProposal({
      contract: contract as any,
      vault,
      additionalContracts: [operatorGridContract],
    });

    if (!log) return;

    const isChangeTier = log.decodedData.functionName === 'changeTier';
    // ChangeTier event from OperatorGrid has 3 args (vault, tierId, shareLimit), but we need only 2 (tierId, shareLimit)
    let args: any = log.decodedData.args;
    if (isChangeTier && args && args.length === 3) {
      args = [args[1], args[2]];
    }

    await callWriteMethodWithReceipt({
      contract,
      methodName: log.decodedData.functionName as any,
      payload: args,
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
  .command('set-node-operator-fee-rate')
  .description('updates the node-operator`s fee rate (basis-points share)')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument(
    '<fee>',
    'the new node operator fee rate in basis points',
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
      methodName: 'setNodeOperatorFeeRate',
      payload: [fee],
    });
  });

dashboardWrite
  .command('disburse-node-operator-fee')
  .description(
    'transfers the node-operator`s accrued fee (if any) to nodeOperatorFeeRecipient',
  )
  .argument('<address>', 'dashboard address', stringToAddress)
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const nodeOperatorFeeRecipient = await callReadMethodSilent(
      contract,
      'nodeOperatorFeeRecipient',
    );

    const confirm = await confirmOperation(
      `Are you sure you want to transfer the node operator fee to ${nodeOperatorFeeRecipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'disburseNodeOperatorFee',
      payload: [],
    });
  });

dashboardWrite
  .command('change-tier')
  .alias('ct')
  .description('vault tier change with multi-role confirmation')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<tierId>', 'tier id', stringToBigInt)
  .argument(
    '<requestedShareLimit>',
    'requested share limit (in shares)',
    etherToWei,
  )
  .action(
    async (address: Address, tierId: bigint, requestedShareLimit: bigint) => {
      const contract = getDashboardContract(address);
      const vault = await callReadMethod(contract, 'stakingVault');

      const confirm = await confirmOperation(
        `Are you sure you want to change the current tier to tier ID ${tierId} for vault ${vault} with share limit ${formatEther(requestedShareLimit)} shares?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'changeTier',
        payload: [tierId, requestedShareLimit],
      });
    },
  );

dashboardWrite
  .command('sync-tier')
  .alias('st')
  .description('requests a sync of tier on the OperatorGrid')
  .argument('<address>', 'dashboard address', stringToAddress)
  .addHelpText(
    'after',
    `Tier sync confirmation logic:
     - Both vault owner (via this function) AND node operator confirmations are required
     - First call returns false (pending), second call with both confirmations completes the sync
     - Confirmations expire after the configured period (default: 1 day)`,
  )
  .action(async (address: Address) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to sync the tier of the vault ${vault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'syncTier',
      payload: [],
    });
  });

dashboardWrite
  .command('update-share-limit')
  .description('requests a change of share limit on the OperatorGrid')
  .argument('<address>', 'dashboard address', stringToAddress)
  .argument('<shareLimit>', 'share limit', stringToBigInt)
  .action(async (address: Address, shareLimit: bigint) => {
    const contract = getDashboardContract(address);
    const vault = await callReadMethod(contract, 'stakingVault');

    const confirm = await confirmOperation(
      `Are you sure you want to request a change of share limit on the OperatorGrid for the vault ${vault} to ${shareLimit}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'updateShareLimit',
      payload: [shareLimit],
    });
  });
