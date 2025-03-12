import { Address } from 'viem';

import { getStakingVaultContract } from 'contracts';
import { getPublicClient } from 'providers';
import { callReadMethod, isContractAddress, printError } from 'utils';

import { vault } from './main.js';

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
      const depositContract = await contract.read.DEPOSIT_CONTRACT();
      const vaultHub = await contract.read.vaultHub();
      const nodeOperator = await contract.read.nodeOperator();
      const owner = await contract.read.owner();
      const locked = await contract.read.locked();
      const unlocked = await contract.read.unlocked();
      const isBeaconChainDepositsPaused =
        await contract.read.beaconChainDepositsPaused();
      const isOwnerContract = await isContractAddress(owner);

      const payload = {
        vault: address,
        withdrawalCredentials,
        inOutDelta,
        balance,
        valuation,
        locked,
        unlocked,
        isBeaconChainDepositsPaused,
        version,
        initializedVersion,
        depositContract,
        vaultHub,
        nodeOperator,
        owner,
        isOwnerContract,
      };

      console.table(payload);
    } catch (err) {
      printError(err, 'Error when calling read method "info"');
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

vault
  .command('calculateValidatorWithdrawalFee')
  .description('Calculates the withdrawal fee for a validator')
  .argument('<address>', 'vault address')
  .argument('<numberOfKeys>', 'number of validators public keys')
  .action(async (address: Address, numberOfKeys: string) => {
    const contract = getStakingVaultContract(address);

    await callReadMethod(contract, 'calculateValidatorWithdrawalFee', [
      BigInt(numberOfKeys),
    ]);
  });
