import { Address } from 'viem';
import { getConfig, getDeployed } from 'configs';

export const getLocatorAddress = (): Address => {
  const deployed = getDeployed();

  return deployed.lidoLocator.proxy.address as Address;
};

export const getTokenMasterAddress = (): Address => {
  const config = getConfig();
  const deployed = getDeployed();

  if (config.TOKEN_MANAGER) {
    return config.TOKEN_MANAGER;
  }

  return deployed['app:aragon-token-manager'].proxy.address as Address;
};

export const getVotingAddress = (): Address => {
  const config = getConfig();
  const deployed = getDeployed();

  if (config.VOTING) {
    return config.VOTING;
  }

  return deployed['app:aragon-voting'].proxy.address as Address;
};

export const getValidatorConsolidationRequestsAddress = (): Address => {
  const config = getConfig();
  const deployed = getDeployed();
  if (config.VALIDATOR_CONSOLIDATION_REQUESTS) {
    return config.VALIDATOR_CONSOLIDATION_REQUESTS;
  }
  return deployed.validatorConsolidationRequests.address as Address;
};
