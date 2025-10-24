import { printError, showSpinner, logResult } from 'utils';
import { getOperatorGridContract } from 'contracts';

export const getOperatorGridBaseInfo = async () => {
  const hideSpinner = showSpinner();
  try {
    const contract = await getOperatorGridContract();

    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const DEFAULT_TIER_ID = await contract.read.DEFAULT_TIER_ID();
    const DEFAULT_TIER_OPERATOR = await contract.read.DEFAULT_TIER_OPERATOR();
    const LIDO_LOCATOR = await contract.read.LIDO_LOCATOR();
    const REGISTRY_ROLE = await contract.read.REGISTRY_ROLE();
    const nodeOperatorCount = await contract.read.nodeOperatorCount();

    const CONTRACT_ADDRESS = contract.address;

    hideSpinner();

    const payload = {
      CONTRACT_ADDRESS,
      DEFAULT_ADMIN_ROLE,
      DEFAULT_TIER_OPERATOR,
      LIDO_LOCATOR,
      REGISTRY_ROLE,
      DEFAULT_TIER_ID,
      nodeOperatorCount,
    };

    logResult({
      data: Object.entries(payload).map(([key, value]) => [key, value]),
    });
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};

export const getOperatorGridRoles = async () => {
  const hideSpinner = showSpinner();

  try {
    const contract = await getOperatorGridContract();

    const DEFAULT_ADMIN_ROLE = await contract.read.DEFAULT_ADMIN_ROLE();
    const REGISTRY_ROLE = await contract.read.REGISTRY_ROLE();

    const roles = {
      DEFAULT_ADMIN_ROLE,
      REGISTRY_ROLE,
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
