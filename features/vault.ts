import { Address, formatEther } from 'viem';

import { printError, showSpinner, logResult, isContractAddress } from 'utils';
import { getStakingVaultContract } from 'contracts';
import { getPublicClient } from 'providers';

export const getVaultBaseInfo = async (address: Address) => {
  const contract = getStakingVaultContract(address);
  const publicClient = getPublicClient();

  const hideSpinner = showSpinner();

  try {
    const DEPOSIT_CONTRACT = await contract.read.DEPOSIT_CONTRACT();
    const beaconChainDepositsPaused =
      await contract.read.beaconChainDepositsPaused();
    const depositor = await contract.read.depositor();
    const initializedVersion = await contract.read.getInitializedVersion();
    const owner = await contract.read.owner();
    const pendingOwner = await contract.read.pendingOwner();
    const version = await contract.read.version();
    const balance = await publicClient.getBalance({ address });
    const nodeOperator = await contract.read.nodeOperator();
    const withdrawalCredentials = await contract.read.withdrawalCredentials();
    const isOwnerContract = await isContractAddress(owner);
    const availableBalance = await contract.read.availableBalance();
    const stagedBalance = await contract.read.stagedBalance();

    const CONTRACT_ADDRESS = address;

    hideSpinner();

    const payload = {
      DEPOSIT_CONTRACT,
      CONTRACT_ADDRESS,
      owner,
      pendingOwner,
      depositor,
      nodeOperator,
      beaconChainDepositsPaused,
      initializedVersion,
      version,
      balance: `${formatEther(balance)} ETH`,
      availableBalance: `${formatEther(availableBalance)} ETH`,
      stagedBalance: `${formatEther(stagedBalance)} ETH`,
      isOwnerContract,
      withdrawalCredentials,
    };

    logResult({
      data: Object.entries(payload).map(([key, value]) => [key, value]),
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};
