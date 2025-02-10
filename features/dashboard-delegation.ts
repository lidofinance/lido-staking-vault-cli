import { printError } from "@utils";
import { DashboardContract, DelegationContract } from "@contracts";

export const getBaseInfo = async (
  contract: DashboardContract | DelegationContract
) => {
  try {
    const steth = await contract.read.STETH();
    const wsteth = await contract.read.WSTETH();
    const weth = await contract.read.WETH();
    const isInit = await contract.read.initialized();
    const vault = await contract.read.stakingVault();

    const payload = {
      steth,
      wsteth,
      weth,
      vault,
      isInit,
    };

    console.table(Object.entries(payload));
  } catch (err) {
    printError(err, "Error when getting base info");
  }
};
