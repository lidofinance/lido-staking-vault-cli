import { Address, formatEther, Hex, parseEther } from 'viem';
import { Option } from 'commander';

import {
  getOperatorGridContract,
  getStakingVaultContract,
  getVaultHubContract,
} from 'contracts';
import {
  callReadMethod,
  callWriteMethodWithReceipt,
  confirmOperation,
  getCommandsJson,
  logInfo,
  stringToAddress,
  stringToBigInt,
  stringToHexArray,
  stringToBigIntArrayWei,
  createPDGProof,
  showSpinner,
  confirmMakeProof,
  logResult,
  printError,
  logTable,
} from 'utils';

import { vaultHub } from './main.js';

const VaultHubWrite = vaultHub
  .command('write')
  .aliases(['w'])
  .description('vault hub write commands');

VaultHubWrite.addOption(new Option('-cmd2json'));
VaultHubWrite.on('option:-cmd2json', function () {
  logInfo(getCommandsJson(VaultHubWrite));
  process.exit();
});

VaultHubWrite.command('set-allowed-codehash')
  .description(
    'Set if a vault proxy codehash is allowed to be connected to the hub',
  )
  .argument('<codehash>', 'codehash vault proxy codehash')
  .argument('<allowed>', 'allowed')
  .action(async (codehash: Address, allowed: boolean) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to set the vault proxy codehash ${codehash} to ${allowed}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'setAllowedCodehash',
      payload: [codehash, Boolean(allowed)],
    });
  });

VaultHubWrite.command('v-connect')
  .description('connects a vault to the hub (vault master role needed)')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();
    const operatorGridContract = await getOperatorGridContract();

    const [shareLimit, reserveRatio, reserveRatioThreshold, treasuryFeeBP] =
      await callReadMethod(operatorGridContract, 'vaultInfo', [address]);

    const confirm = await confirmOperation(
      `Are you sure you want to connect the vault ${address} with share limit ${shareLimit}, reserve ratio ${reserveRatio}, reserve ratio threshold ${reserveRatioThreshold}, treasury fee ${treasuryFeeBP}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'connectVault',
      payload: [address],
    });
  });

VaultHubWrite.command('v-update-share-limit')
  .description('updates share limit for the vault')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<shareLimit>', 'share limit', stringToBigInt)
  .action(async (address: Address, shareLimit: bigint) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to update the share limit for the vault ${address} to ${shareLimit}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'updateShareLimit',
      payload: [address, shareLimit],
    });
  });

VaultHubWrite.command('v-disconnect')
  .description(
    'disconnect a vault from the hub. msg.sender must have VAULT_MASTER_ROLE. vault`s "liabilityShares" should be zero',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to force disconnect the vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'disconnect',
      payload: [address],
    });
  });

VaultHubWrite.command('v-owner-disconnect')
  .description(
    "disconnects a vault from the hub, msg.sender should be vault's owner",
  )
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to disconnect the vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'voluntaryDisconnect',
      payload: [address],
    });
  });

VaultHubWrite.command('v-mint')
  .description(
    ' mint StETH shares backed by vault external balance to the receiver address',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<recipient>', 'address of the receiver')
  .argument('<amountOfShares>', 'amount of stETH shares to mint (in Shares)')
  .action(
    async (address: Address, recipient: Address, amountOfShares: string) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to mint ${amountOfShares} stETH shares to ${recipient}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'mintShares',
        payload: [address, recipient, parseEther(amountOfShares)],
      });
    },
  );

VaultHubWrite.command('v-burn')
  .description('burn steth shares from the balance of the VaultHub contract')
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<amountOfShares>', 'amount of stETH shares to burn (in Shares)')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to burn ${amountOfShares} stETH shares from vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'burnShares',
      payload: [address, parseEther(amountOfShares)],
    });
  });

VaultHubWrite.command('v-transfer-and-burn')
  .description(
    'separate burn function for EOA vault owners; requires vaultHub to be approved to transfer stETH',
  )
  .argument('<address>', 'vault address', stringToAddress)
  .argument('<amountOfShares>', 'amount of stETH shares to burn (in Shares)')
  .action(async (address: Address, amountOfShares: string) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to transfer and burn ${amountOfShares} stETH shares from vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'transferAndBurnShares',
      payload: [address, parseEther(amountOfShares)],
    });
  });

VaultHubWrite.command('v-force-rebalance')
  .description('force rebalance of the vault to have sufficient reserve ratio')
  .argument('<address>', 'vault address', stringToAddress)
  .action(async (address: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to force rebalance the vault ${address}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'forceRebalance',
      payload: [address],
    });
  });

VaultHubWrite.command('v-rebalance')
  .description(
    'rebalances StakingVault by withdrawing ether to VaultHub. msg.sender should be vault`s owner',
  )
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<amount>', 'amount of ether to rebalance')
  .action(async (vaultAddress: Address, amount: string) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to rebalance the vault ${vaultAddress} with ${amount} ether?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'rebalance',
      payload: [vaultAddress, parseEther(amount)],
    });
  });

VaultHubWrite.command('v-force-validator-exit')
  .description('force validator exit')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<validatorPubkey>', 'validator pubkey')
  .argument('<refundRecipient>', 'refund recipient', stringToAddress)
  .action(
    async (
      vaultAddress: Address,
      validatorPubkey: Hex,
      refundRecipient: Address,
    ) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to force validator exit for validator pubkey ${validatorPubkey} and refund recipient ${refundRecipient} in vault ${vaultAddress}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'forceValidatorExit',
        payload: [vaultAddress, validatorPubkey, refundRecipient],
      });
    },
  );

VaultHubWrite.command('update-vault-fees')
  .description(
    'updates fees for the vault. msg.sender must have VAULT_MASTER_ROLE',
  )
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<infraFeeBP>', 'new infra fee in basis points', stringToBigInt)
  .argument(
    '<liquidityFeeBP>',
    'new liquidity fee in basis points',
    stringToBigInt,
  )
  .argument(
    '<reservationFeeBP>',
    'new reservation fee in basis points',
    stringToBigInt,
  )
  .action(
    async (
      vaultAddress: Address,
      infraFeeBP: bigint,
      liquidityFeeBP: bigint,
      reservationFeeBP: bigint,
    ) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to update the fees for the vault ${vaultAddress} to ${infraFeeBP}, ${liquidityFeeBP}, ${reservationFeeBP}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'updateVaultFees',
        payload: [vaultAddress, infraFeeBP, liquidityFeeBP, reservationFeeBP],
      });
    },
  );

VaultHubWrite.command('transfer-vault-ownership')
  .description('transfer the ownership of the vault to a new owner')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<newOwner>', 'new owner address', stringToAddress)
  .action(async (vaultAddress: Address, newOwner: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to transfer ownership of the vault ${vaultAddress} to ${newOwner}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'transferVaultOwnership',
      payload: [vaultAddress, newOwner],
    });
  });

VaultHubWrite.command('fund-vault')
  .description('funds the vault passing ether as msg.value')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<amount>', 'amount of ether to fund')
  .action(async (vaultAddress: Address, amount: string) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to fund the vault ${vaultAddress} with ${amount} ether?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'fund',
      payload: [vaultAddress],
      value: parseEther(amount),
    });
  });

VaultHubWrite.command('withdraw-vault')
  .description('withdraws ether from the vault to the recipient address')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<amount>', 'amount of ether to withdraw')
  .argument('<recipient>', 'recipient address', stringToAddress)
  .action(async (vaultAddress: Address, amount: string, recipient: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to withdraw ${amount} ether from the vault ${vaultAddress} to ${recipient}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'withdraw',
      payload: [vaultAddress, recipient, parseEther(amount)],
    });
  });

VaultHubWrite.command('pause-beacon-chain-deposits')
  .description('pauses beacon chain deposits for the vault')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .action(async (vaultAddress: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to pause beacon chain deposits for the vault ${vaultAddress}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'pauseBeaconChainDeposits',
      payload: [vaultAddress],
    });
  });

VaultHubWrite.command('resume-beacon-chain-deposits')
  .description('resumes beacon chain deposits for the vault')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .action(async (vaultAddress: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to resume beacon chain deposits for the vault ${vaultAddress}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'resumeBeaconChainDeposits',
      payload: [vaultAddress],
    });
  });

VaultHubWrite.command('request-validator-exit')
  .description(
    'emits a request event for the node operator to perform validator exit',
  )
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument(
    '<validatorPubkeys>',
    'pubkeys array of public keys of the validators to exit',
    stringToHexArray,
  )
  .action(async (vaultAddress: Address, validatorPubkeys: Hex[]) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to request validator exit for the vault ${vaultAddress} with validator pubkeys ${validatorPubkeys}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'requestValidatorExit',
      payload: [vaultAddress, validatorPubkeys.join('') as Hex],
    });
  });

VaultHubWrite.command('trigger-validator-withdrawals')
  .description('triggers validator withdrawals for the vault using EIP-7002')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument(
    '<validatorPubkeys>',
    'pubkeys array of public keys of the validators to exit',
    stringToHexArray,
  )
  .argument(
    '<withdrawalAmounts>',
    'withdrawal amounts array of the validators to exit',
    stringToBigIntArrayWei,
  )
  .argument('<recipient>', 'recipient address', stringToAddress)
  .action(
    async (
      address: Address,
      pubkeys: Hex[],
      amounts: bigint[],
      recipient: Address,
    ) => {
      const mergedPubkeys: Hex = pubkeys.join('') as Hex;
      const contract = await getVaultHubContract();

      const confirmationMessage = `Are you sure you want to trigger the withdrawal of the validators 
      ${pubkeys.join(', ')} 
      from the staking vault ${address} to ${recipient} 
      with amounts ${amounts.map((amount) => formatEther(amount)).join(', ')} ETH?`;
      const confirm = await confirmOperation(confirmationMessage);
      if (!confirm) return;

      const vaultContract = getStakingVaultContract(address);
      const fee = await callReadMethod(
        vaultContract,
        'calculateValidatorWithdrawalFee',
        [BigInt(amounts.length)],
      );

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'triggerValidatorWithdrawals',
        payload: [address, mergedPubkeys, amounts.map(BigInt), recipient],
        value: fee,
      });
    },
  );

VaultHubWrite.command('prove-unknown-validator-to-pdg')
  .description(
    'proves that validators unknown to PDG have correct WC to participate in the vault',
  )
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<validatorIndex>', 'validator index', stringToBigInt)
  .action(async (vaultAddress: Address, index: bigint) => {
    const contract = await getVaultHubContract();

    const validatorIndex = await confirmMakeProof(index);
    if (!validatorIndex) return;

    const hideSpinner = showSpinner({
      type: 'bouncingBar',
      message: 'Making proof...',
    });
    try {
      const packageProof = await createPDGProof(Number(validatorIndex));
      hideSpinner();
      const {
        proof,
        pubkey,
        childBlockTimestamp,
        withdrawalCredentials,
        slot,
        proposerIndex,
      } = packageProof;

      logResult({});
      logInfo('----------------------proof----------------------');
      logInfo(proof);
      logInfo('-------------------------------------------------');
      logTable({
        data: [
          ['Pubkey', pubkey],
          ['Child Block Timestamp', childBlockTimestamp],
          ['Withdrawal Credentials', withdrawalCredentials],
          ['Slot', slot],
          ['Proposer Index', proposerIndex],
        ],
      });
      logInfo('-----------------------end-----------------------');

      await callWriteMethodWithReceipt({
        contract: contract,
        methodName: 'proveUnknownValidatorToPDG',
        payload: [
          vaultAddress,
          {
            proof,
            pubkey,
            validatorIndex,
            childBlockTimestamp,
            slot,
            proposerIndex,
          },
        ],
      });
    } catch (err) {
      hideSpinner();
      printError(err, 'Error when making proof');
    }
  });

VaultHubWrite.command('compensate-disproven-predeposit-from-pdg')
  .description('compensates disproven predeposit from PDG to the recipient')
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .argument('<validatorPubkey>', 'validator pubkey')
  .argument('<recipient>', 'recipient address', stringToAddress)
  .action(
    async (vaultAddress: Address, validatorPubkey: Hex, recipient: Address) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to compensate disproven predeposit from PDG to the recipient ${recipient} for validator ${validatorPubkey} in vault ${vaultAddress}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'compensateDisprovenPredepositFromPDG',
        payload: [vaultAddress, validatorPubkey, recipient],
      });
    },
  );

VaultHubWrite.command('socialize-bad-debt')
  .description(
    'transfer the bad debt from the donor vault to the acceptor vault. msg.sender must have BAD_DEBT_MASTER_ROLE',
  )
  .argument(
    '<badDebtVault>',
    'address of the vault that has the bad debt',
    stringToAddress,
  )
  .argument(
    '<acceptorVault>',
    'address of the vault that will accept the bad debt',
    stringToAddress,
  )
  .argument(
    '<maxSharesToSocialize>',
    'maximum amount of shares to socialize',
    stringToBigInt,
  )
  .action(
    async (
      badDebtVault: Address,
      acceptorVault: Address,
      maxSharesToSocialize: bigint,
    ) => {
      const contract = await getVaultHubContract();

      const confirm = await confirmOperation(
        `Are you sure you want to socialize bad debt from the vault ${badDebtVault} to the vault ${acceptorVault}?`,
      );
      if (!confirm) return;

      await callWriteMethodWithReceipt({
        contract,
        methodName: 'socializeBadDebt',
        payload: [badDebtVault, acceptorVault, maxSharesToSocialize],
      });
    },
  );

VaultHubWrite.command('internalize-bad-debt')
  .description(
    'internalize the bad debt to the protocol. msg.sender must have BAD_DEBT_MASTER_ROLE',
  )
  .argument(
    '<badDebtVault>',
    'address of the vault that has the bad debt',
    stringToAddress,
  )
  .argument(
    '<maxSharesToInternalize>',
    'maximum amount of shares to internalize',
    stringToBigInt,
  )
  .action(async (badDebtVault: Address, maxSharesToInternalize: bigint) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to internalize bad debt from the vault ${badDebtVault}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'internalizeBadDebt',
      payload: [badDebtVault, maxSharesToInternalize],
    });
  });

VaultHubWrite.command('settle-vault-obligations')
  .description(
    'allows permissionless full or partial settlement of unsettled obligations on the vault',
  )
  .argument('<vaultAddress>', 'vault address', stringToAddress)
  .action(async (vaultAddress: Address) => {
    const contract = await getVaultHubContract();

    const confirm = await confirmOperation(
      `Are you sure you want to settle the obligations of the vault ${vaultAddress}?`,
    );
    if (!confirm) return;

    await callWriteMethodWithReceipt({
      contract,
      methodName: 'settleVaultObligations',
      payload: [vaultAddress],
    });
  });
