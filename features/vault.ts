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
    const PUBLIC_KEY_LENGTH = await contract.read.PUBLIC_KEY_LENGTH();
    const beaconChainDepositsPaused =
      await contract.read.beaconChainDepositsPaused();
    const depositor = await contract.read.depositor();
    const initializedVersion = await contract.read.getInitializedVersion();
    const owner = await contract.read.owner();
    const version = await contract.read.version();
    const vaultHubAuthorized = await contract.read.vaultHubAuthorized();
    const vaultHub = await contract.read.vaultHub();
    const totalValue = await contract.read.totalValue();
    const inOutDelta = await contract.read.inOutDelta();
    const balance = await publicClient.getBalance({ address });
    const nodeOperator = await contract.read.nodeOperator();
    const locked = await contract.read.locked();
    const unlocked = await contract.read.unlocked();
    const isOwnerContract = await isContractAddress(owner);

    const CONTRACT_ADDRESS = address;

    hideSpinner();

    const payload = {
      DEPOSIT_CONTRACT,
      PUBLIC_KEY_LENGTH,
      CONTRACT_ADDRESS,
      owner,
      depositor,
      nodeOperator,
      vaultHub,
      vaultHubAuthorized,
      beaconChainDepositsPaused,
      initializedVersion,
      version,
      totalValue: `${formatEther(totalValue)} ETH`,
      inOutDelta: `${formatEther(inOutDelta)} ETH`,
      balance: `${formatEther(balance)} ETH`,
      locked: `${formatEther(locked)} ETH`,
      unlocked: `${formatEther(unlocked)} ETH`,
      isOwnerContract,
    };

    logResult({
      data: Object.entries(payload).map(([key, value]) => [key, value]),
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};
