import { Address } from 'viem';

import { DelegationAbi } from 'abi';
import { getDelegationContract, getStakingVaultContract } from 'contracts';
import { generateReadCommands } from 'utils';
import { getBaseInfo } from 'features';

import { delegation } from './main.js';
import { readCommandConfig } from './config.js';

generateReadCommands(
  DelegationAbi,
  getDelegationContract,
  delegation,
  readCommandConfig,
);

delegation
  .command('roles')
  .description('get delegation contract roles info')
  .argument('<address>', 'delegation contract address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);

    // TODO: check roles
    try {
      const CURATOR_FEE_CLAIM_ROLE =
        await contract.read.CURATOR_FEE_CLAIM_ROLE();
      const CURATOR_FEE_SET_ROLE = await contract.read.CURATOR_FEE_SET_ROLE();
      const NODE_OPERATOR_MANAGER_ROLE =
        await contract.read.NODE_OPERATOR_MANAGER_ROLE();
      const NODE_OPERATOR_FEE_CLAIMER_ROLE =
        await contract.read.NODE_OPERATOR_FEE_CLAIM_ROLE();
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
      const TRIGGER_VALIDATOR_WITHDRAWAL_ROLE =
        await contract.read.TRIGGER_VALIDATOR_WITHDRAWAL_ROLE();
      const PDG_WITHDRAWAL_ROLE = await contract.read.PDG_WITHDRAWAL_ROLE();
      const ASSET_RECOVERY_ROLE = await contract.read.ASSET_RECOVERY_ROLE();

      const payload = {
        CURATOR_FEE_CLAIM_ROLE,
        CURATOR_FEE_SET_ROLE,
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
        TRIGGER_VALIDATOR_WITHDRAWAL_ROLE,
        PDG_WITHDRAWAL_ROLE,
        ASSET_RECOVERY_ROLE,
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
