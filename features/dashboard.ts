import { DashboardContract } from 'contracts';

import {
  getVaultHealthByDashboard,
  getVaultInfoByDashboard,
  getVaultOverviewByDashboard,
  getVaultRolesByDashboard,
} from './vault-operations/index.js';

export const getDashboardHealth = async (contract: DashboardContract) => {
  return getVaultHealthByDashboard(contract);
};

export const getDashboardOverview = async (contract: DashboardContract) => {
  return getVaultOverviewByDashboard(contract);
};

export const getDashboardBaseInfo = async (contract: DashboardContract) => {
  await getVaultInfoByDashboard(contract);
};

export const getDashboardRoles = async (contract: DashboardContract) => {
  await getVaultRolesByDashboard(contract);
};
