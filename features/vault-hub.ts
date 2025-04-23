import { printError, showSpinner, logResult } from 'utils';
import { getVaultHubContract } from 'contracts';
import { formatEther } from 'viem';

export const getVaultHubBaseInfo = async () => {
  const hideSpinner = showSpinner();
  try {
    const contract = await getVaultHubContract();

    const CONNECT_DEPOSIT = await contract.read.CONNECT_DEPOSIT();
    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const LIDO = await contract.read.LIDO();
    const LIDO_LOCATOR = await contract.read.LIDO_LOCATOR();
    const PAUSE_INFINITELY = await contract.read.PAUSE_INFINITELY();
    const PAUSE_ROLE = await contract.read.PAUSE_ROLE();
    const REPORT_FRESHNESS_DELTA = await contract.read.REPORT_FRESHNESS_DELTA();
    const RESUME_ROLE = await contract.read.RESUME_ROLE();
    const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
    const VAULT_REGISTRY_ROLE = await contract.read.VAULT_REGISTRY_ROLE();
    const resumeSinceTimestamp = await contract.read.getResumeSinceTimestamp();
    const isPaused = await contract.read.isPaused();
    const operatorGrid = await contract.read.operatorGrid();
    const vaultsCount = await contract.read.vaultsCount();

    const CONTRACT_ADDRESS = contract.address;

    hideSpinner();

    const payload = {
      CONNECT_DEPOSIT: `${formatEther(CONNECT_DEPOSIT)} ETH`,
      DEFAULT_ADMIN_ROLE,
      LIDO,
      LIDO_LOCATOR,
      PAUSE_INFINITELY,
      PAUSE_ROLE,
      REPORT_FRESHNESS_DELTA,
      reportFreshnessDeltaHours: `${
        Number(REPORT_FRESHNESS_DELTA) / 60 / 60
      } hours`,
      RESUME_ROLE,
      VAULT_MASTER_ROLE,
      VAULT_REGISTRY_ROLE,
      resumeSinceTimestamp,
      isPaused,
      operatorGrid,
      vaultsCount,
      CONTRACT_ADDRESS,
    };

    logResult(Object.entries(payload));
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};

export const getVaultHubRoles = async () => {
  const hideSpinner = showSpinner();

  try {
    const contract = await getVaultHubContract();

    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const PAUSE_ROLE = await contract.read.PAUSE_ROLE();
    const RESUME_ROLE = await contract.read.RESUME_ROLE();
    const VAULT_MASTER_ROLE = await contract.read.VAULT_MASTER_ROLE();
    const VAULT_REGISTRY_ROLE = await contract.read.VAULT_REGISTRY_ROLE();

    const roles = {
      DEFAULT_ADMIN_ROLE,
      PAUSE_ROLE,
      RESUME_ROLE,
      VAULT_MASTER_ROLE,
      VAULT_REGISTRY_ROLE,
    };

    const result = await Promise.all(
      Object.entries(roles).map(async ([key, value]) => {
        const accounts = await contract.read.getRoleMembers([value]);
        const roleName = `${key} (${value})`;
        return {
          Role: roleName,
          Members: accounts.length > 0 ? accounts.join(', ') : 'None',
        };
      }),
    );
    hideSpinner();
    logResult(result);
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting roles');
  }
};
