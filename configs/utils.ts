import { Address } from 'viem';
import { getConfig, getDeployed } from 'configs';

export const getLocatorAddress = (): Address => {
  const config = getConfig();
  const deployed = getDeployed();

  if (config.lidoLocator) {
    return config.lidoLocator;
  }

  return deployed.lidoLocator.proxy.address as Address;
};

export const getTokenMasterAddress = (): Address => {
  const config = getConfig();
  const deployed = getDeployed();

  if (config.tokenManager) {
    return config.tokenManager;
  }

  return deployed['app:aragon-token-manager'].proxy.address as Address;
};

export const getVotingAddress = (): Address => {
  const config = getConfig();
  const deployed = getDeployed();

  if (config.voting) {
    return config.voting;
  }

  return deployed['app:aragon-voting'].proxy.address as Address;
};
