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
    const VAULT_CODEHASH_SET_ROLE =
      await contract.read.VAULT_CODEHASH_SET_ROLE();
    const MAX_RELATIVE_SHARE_LIMIT_BP =
      await contract.read.MAX_RELATIVE_SHARE_LIMIT_BP();
    const resumeSinceTimestamp = await contract.read.getResumeSinceTimestamp();
    const isPaused = await contract.read.isPaused();
    const vaultsCount = await contract.read.vaultsCount();
    const CONTRACT_ADDRESS = contract.address;

    hideSpinner();

    const payload = {
      CONTRACT_ADDRESS,
      DEFAULT_ADMIN_ROLE,
      LIDO,
      LIDO_LOCATOR,
      PAUSE_INFINITELY,
      PAUSE_ROLE,
      RESUME_ROLE,
      VAULT_MASTER_ROLE,
      VAULT_CODEHASH_SET_ROLE,
      MAX_RELATIVE_SHARE_LIMIT_BP,
      CONNECT_DEPOSIT: `${formatEther(CONNECT_DEPOSIT)} ETH`,
      REPORT_FRESHNESS_DELTA,
      reportFreshnessDeltaHours: `${
        Number(REPORT_FRESHNESS_DELTA) / 60 / 60
      } hours`,
      resumeSinceTimestamp,
      isPaused,
      vaultsCount,
    };

    logResult({
      data: Object.entries(payload).map(([key, value]) => [key, value]),
    });
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
    const VAULT_CODEHASH_SET_ROLE =
      await contract.read.VAULT_CODEHASH_SET_ROLE();

    const roles = {
      DEFAULT_ADMIN_ROLE,
      PAUSE_ROLE,
      RESUME_ROLE,
      VAULT_MASTER_ROLE,
      VAULT_CODEHASH_SET_ROLE,
    };

    const result = await Promise.all(
      Object.entries(roles).map(async ([key, value]) => {
        const accounts = await contract.read.getRoleMembers([value]);
        return {
          Role: key,
          Keccak: value,
          Members: accounts.length > 0 ? accounts.join(', ') : 'None',
        };
      }),
    );
    hideSpinner();
    logResult({
      data: result.map(({ Role, Keccak, Members }) => [Role, Keccak, Members]),
      params: {
        head: ['Role', 'Keccak', 'Members'],
      },
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting roles');
  }
};
