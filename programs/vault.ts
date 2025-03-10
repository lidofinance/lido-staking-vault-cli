import { Address } from 'viem';
import { program } from 'command';

import { getStakingVaultContract } from 'contracts';
import { getPublicClient } from 'providers';
import {
  callWriteMethodWithReceipt,
  callReadMethod,
  isContractAddress,
} from 'utils';

const vault = program.command('vault').description('vault contract');

vault
  .command('info')
  .description('get vault base info')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const publicClient = getPublicClient();

    try {
      const withdrawalCredentials = await contract.read.withdrawalCredentials();
      const inOutDelta = await contract.read.inOutDelta();
      const balance = await publicClient.getBalance({ address });
      const valuation = await contract.read.valuation();
      const version = await contract.read.version();
      const initializedVersion = await contract.read.getInitializedVersion();
      const depositContract = await contract.read.depositContract();
      const nodeOperator = await contract.read.nodeOperator();
      const owner = await contract.read.owner();
      const isBalanced = await contract.read.isBalanced();
      const isOwnerContract = await isContractAddress(owner);

      const payload = {
        vault: address,
        withdrawalCredentials,
        inOutDelta,
        balance,
        valuation,
        isBalanced,
        version,
        initializedVersion,
        depositContract,
        nodeOperator,
        owner,
        isOwnerContract,
      };

      console.table(payload);
    } catch (err) {
      if (err instanceof Error) {
        program.error(err.message);
      }
    }
  });

// Works
vault
  .command('l-report')
  .description('get latest vault report')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const latestReport = await callReadMethod(contract, 'latestReport');

    console.table({ 'latest report': latestReport });
  });

// Works
vault
  .command('is-balanced')
  .description(
    'returns whether `StakingVault` is balanced, i.e. its valuation is greater than the locked amount',
  )
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const isBalanced = await callReadMethod(contract, 'isBalanced');

    console.table({ 'Is balanced': isBalanced });
  });
vault
  .command('node-operator')
  .description('Returns the address of the node operator')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const nodeOperator = await callReadMethod(contract, 'nodeOperator');

    console.table({ 'Node Operator': nodeOperator });
  });

// Works
vault
  .command('valuation')
  .description('get vault valuation')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const valuation = await callReadMethod(contract, 'valuation');

    console.table({ valuation });
  });

// Works
vault
  .command('unlocked')
  .description('get vault unlocked')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const unlocked = await callReadMethod(contract, 'unlocked');

    console.table({ unlocked });
  });

// Works
vault
  .command('locked')
  .description('get vault locked')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const locked = await callReadMethod(contract, 'locked');

    console.table({ locked });
  });

// Works
vault
  .command('withdrawal-c')
  .description('get vault withdrawal credentials')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const wc = await callReadMethod(contract, 'withdrawalCredentials');

    console.table({ wc });
  });

vault
  .command('fund')
  .description('fund vault')
  .argument('<address>', 'vault address')
  .argument('<wei>', 'amount to fund (in WEI)')
  .action(async (address: Address, amount: string) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'fund', [], BigInt(amount));
  });

// TODO: investigate why only owner can fund vault
vault
  .command('withdraw')
  .description('withdraw from vault')
  .argument('<address>', 'vault address')
  .argument('<recipient>', 'recipient address')
  .argument('<wei>', 'amount to withdraw (in WEI)')
  .action(async (address: Address, recipient: Address, amount: string) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'withdraw', [
      recipient,
      BigInt(amount),
    ]);
  });

// NOs
// TODO: get more details
vault
  .command('no-deposit-beacon')
  .description('deposit to beacon chain')
  .argument('<address>', 'vault address')
  .argument('<amountOfDeposit>', 'amount of deposits')
  .argument('<pubkey>', 'pubkey')
  .argument('<signature>', 'signature')
  .argument('<depositDataRoot>', 'depositDataRoot')
  .action(
    async (
      vault: Address,
      amountOfDeposit: string,
      pubkey: `0x${string}`,
      signature: `0x${string}`,
      depositDataRoot: `0x${string}`,
    ) => {
      const amount = BigInt(amountOfDeposit);
      const contract = getStakingVaultContract(vault);

      const payload = [
        {
          pubkey,
          signature,
          amount,
          depositDataRoot,
        },
      ];

      await callWriteMethodWithReceipt(contract, 'depositToBeaconChain', [
        payload,
      ]);
    },
  );

// TODO: get more details
vault
  .command('no-val-exit')
  .description('request to exit validator')
  .argument('<address>', 'vault address')
  .argument('<validatorPublicKey>', 'validator public key')
  .action(async (address: Address, validatorPublicKey: Address) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'requestValidatorExit', [
      validatorPublicKey,
    ]);
  });

// Works
vault
  .command('delta')
  .description('the net difference between deposits and withdrawals')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    const inOutDelta = await callReadMethod(contract, 'inOutDelta');

    console.table({ 'In Out Delta': inOutDelta });
  });

vault
  .command('is-paused')
  .description('Returns whether deposits are paused by the vault owner')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);
    const isPaused = await callReadMethod(
      contract,
      'beaconChainDepositsPaused',
    );

    console.table({ 'Is paused': isPaused });
  });

vault
  .command('bc-resume')
  .description('Resumes deposits to beacon chain')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'resumeBeaconChainDeposits', []);
  });

vault
  .command('bc-pause')
  .description('Pauses deposits to beacon chain')
  .argument('<address>', 'vault address')
  .action(async (address: Address) => {
    const contract = getStakingVaultContract(address);

    await callWriteMethodWithReceipt(contract, 'pauseBeaconChainDeposits', []);
  });

vault
  .command('report')
  .description(
    'Submits a report containing valuation, inOutDelta, and locked amount',
  )
  .argument('<address>', 'vault address')
  .argument(
    '<valuation>',
    'New total valuation: validator balances + StakingVault balance',
  )
  .argument(
    '<inOutDelta>',
    'New net difference between funded and withdrawn ether',
  )
  .argument('<locked>', 'New amount of locked ether')
  .action(
    async (
      address: Address,
      valuation: string,
      inOutDelta: string,
      locked: string,
    ) => {
      const contract = getStakingVaultContract(address);

      await callWriteMethodWithReceipt(contract, 'report', [
        BigInt(valuation),
        BigInt(inOutDelta),
        BigInt(locked),
      ]);
    },
  );

vault
  .command('compute-deposit')
  .description('Computes the deposit data root for a validator deposit')
  .argument('<address>', 'vault address')
  .argument('<pubkey>', 'Validator public key, 48 bytes')
  .argument('<withdrawalCredentials>', 'Withdrawal credentials, 32 bytes')
  .argument('<signature>', 'Signature of the deposit, 96 bytes')
  .argument('<amount>', 'Amount of ether to deposit, in wei')
  .action(
    async (
      address: Address,
      pubkey: `0x${string}`,
      withdrawalCredentials: `0x${string}`,
      signature: `0x${string}`,
      amount: string,
    ) => {
      const contract = getStakingVaultContract(address);
      const encodedData = await callReadMethod(
        contract,
        'computeDepositDataRoot',
        [pubkey, withdrawalCredentials, signature, BigInt(amount)],
      );

      console.table({ 'Encoded data': encodedData });
    },
  );
