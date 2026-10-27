import { Address } from 'viem';
import { getConfig, getDeployed } from 'configs/deployed.js';
import { PREVIOUS_DASHBOARD_IMPLS } from 'configs/constants.js';

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

export const getDashboardImplAddress = (): Address => {
  const deployed = getDeployed();

  return deployed.dashboardImpl.address as Address;
};

// Current deployed impl plus earlier ones still backing live Dashboards
export const getDashboardImplAddresses = (): Address[] => {
  const deployed = getDeployed();
  const previous = PREVIOUS_DASHBOARD_IMPLS[Number(deployed.networkId)] ?? [];

  return [deployed.dashboardImpl.address as Address, ...previous];
};
