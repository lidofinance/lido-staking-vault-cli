import { printError, showSpinner, logResult } from 'utils';
import { DashboardContract, DelegationContract } from 'contracts';

export const getBaseInfo = async (
  contract: DashboardContract | DelegationContract,
) => {
  const hideSpinner = showSpinner();
  try {
    const steth = await contract.read.STETH();
    const wsteth = await contract.read.WSTETH();
    const weth = await contract.read.WETH();
    const isInit = await contract.read.initialized();
    const vault = await contract.read.stakingVault();

    hideSpinner();

    const payload = {
      steth,
      wsteth,
      weth,
      vault,
      isInit,
    };

    logResult(Object.entries(payload));
  } catch (err) {
    hideSpinner();
    printError(err, 'Error when getting base info');
  }
};
