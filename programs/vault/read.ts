import { Address } from 'viem';

import { getStakingVaultContract } from 'contracts';
import { getPublicClient } from 'providers';
import { StakingVaultAbi } from 'abi';
import {
  generateReadCommands,
  isContractAddress,
  printError,
  logResult,
} from 'utils';

import { vault } from './main.js';
import { readCommandConfig } from './config.js';

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

      logResult(payload);
    } catch (err) {
      printError(err, 'Error when calling read method "info"');
    }
  });

generateReadCommands(
  StakingVaultAbi,
  getStakingVaultContract,
  vault,
  readCommandConfig,
);
