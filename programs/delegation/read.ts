import { Address, formatEther } from 'viem';

import { DelegationAbi } from 'abi';
import { getDelegationContract, getStethContract } from 'contracts';
import { generateReadCommands, calculateHealthRatio } from 'utils';
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
  .command('health')
  .description('get vault health info')
  .argument('<address>', 'delegation address')
  .action(async (address: Address) => {
    const contract = getDelegationContract(address);
    const stethContract = await getStethContract();

    try {
      const [valuation, minted, rebalanceThresholdBP] = await Promise.all([
        contract.read.valuation(), // BigInt, in wei
        contract.read.sharesMinted(), // BigInt, in shares
        contract.read.rebalanceThresholdBP(), // number (in basis points)
      ]);
      if (minted === BigInt(0)) {
        console.info('Minted is 0');
        return;
      }

      const mintedInSteth = await stethContract.read.getPooledEthByShares([
        minted,
      ]); // BigInt

      const { healthRatioNumber, isHealthy } = calculateHealthRatio(
        valuation,
        mintedInSteth,
        rebalanceThresholdBP,
      );

      console.table({
        'Vault Healthy': isHealthy,
        'Valuation, wei': valuation,
        'Valuation, ether': `${formatEther(valuation)} ETH`,
        'Minted, stETH': `${mintedInSteth} stETH`,
        'Rebalance Threshold, BP': rebalanceThresholdBP,
        'Rebalance Threshold, %': `${rebalanceThresholdBP / 100}%`,
        'Health Rate': `${healthRatioNumber}%`,
      });
    } catch (err) {
      if (err instanceof Error) {
        console.info('Error when getting info:\n', err.message);
      }
    }
  });
