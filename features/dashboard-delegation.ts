import { Address } from "viem";

import { printError } from "@utils";
import { getAccount } from "@providers";
import { getChain } from "@configs";
import {DashboardContract, DelegationContract, getDashboardContract, getDelegationContract} from "@contracts";
import { Permit, RoleAssignment } from "@types";

export const getBaseInfo = async (contract: DashboardContract | DelegationContract) => {
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
    }

    console.table(Object.entries(payload));
  } catch (err) {
    printError(err, 'Error when getting base info');
  }
};

export const getCommittee = async (contract: DashboardContract | DelegationContract) => {
  try {
    const votingCommittee = await contract.read.votingCommittee();

    console.table(votingCommittee);
  } catch (err) {
    printError(err, 'Error when getting voting committee info');
  }
};

export const getVaultSocket = async (contract: DashboardContract | DelegationContract) => {
  try {
    const vaultInfo = await contract.read.vaultSocket();
    console.table(Object.values(vaultInfo));
  } catch (err) {
    printError(err, 'Error when getting vault info');
  }
};

export const getShareLimit = async (contract: DashboardContract | DelegationContract) => {
  try {
    const shareLimit = await contract.read.shareLimit();
    console.table({ 'Share limit': shareLimit });
  } catch (err) {
    printError(err, 'Error when getting share limit');
  }
};

export const getSharesMinted = async (contract: DashboardContract | DelegationContract) => {
  try {
    const sharesMinted = await contract.read.sharesMinted();
    console.table({ 'Share minted': sharesMinted });
  } catch (err) {
    printError(err, 'Error when getting shares minted');
  }
};

export const getReserveRatioBP = async (contract: DashboardContract | DelegationContract) => {
  try {
    const reserveRatio = await contract.read.reserveRatioBP();
    console.table({ 'Reserve ratio BP': reserveRatio });
  } catch (err) {
    printError(err, 'Error when getting reserve ratio');
  }
};

export const getThresholdReserveRatioBP = async (contract: DashboardContract | DelegationContract) => {
  try {
    const thresholdReserveRatio = await contract.read.thresholdReserveRatioBP();
    console.table({ 'Threshold reserve ratio BP': thresholdReserveRatio });
  } catch (err) {
    printError(err, 'Error when getting threshold reserve ratio');
  }
};

export const getTreasuryFee = async (contract: DashboardContract | DelegationContract) => {
  try {
    const treasuryFee = await contract.read.treasuryFee();
    console.table({ 'Treasury fee': treasuryFee });
  } catch (err) {
    printError(err, 'Error when getting treasury fee');
  }
};

export const getValuation = async (contract: DashboardContract | DelegationContract) => {
  try {
    const valuation = await contract.read.valuation();
    console.table({ Valuation: valuation });
  } catch (err) {
    printError(err, 'Error when getting valuation of the vault in ether');
  }
};

export const getTotalMintableShares = async (contract: DashboardContract | DelegationContract) => {
  try {
    const totalMintableShares = await contract.read.totalMintableShares();
    console.table({ 'Total mintable shares': totalMintableShares });
  } catch (err) {
    printError(err, 'Error when getting total of shares that can be minted on the vault');
  }
};

export const getProjectedNewMintableShares = async (contract: DashboardContract | DelegationContract, payload: [bigint]) => {
  try {
    const mintableShares = await contract.read.projectedNewMintableShares(payload);
    console.table({ 'Mintable shares': mintableShares });
  } catch (err) {
    printError(err, 'Error when getting maximum number of shares that can be minted with deposited ether');
  }
};

export const getWithdrawableEther = async (contract: DashboardContract | DelegationContract) => {
  try {
    const withdrawableEther = await contract.read.withdrawableEther();
    console.table({ 'Withdrawable ether': withdrawableEther });
  } catch (err) {
    printError(err, 'Error when getting amount of ether that can be withdrawn from the staking vault');
  }
};

export const transferStakingVaultOwnership = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address]
) => {
  try {
    const tx = await contract.write.transferStakingVaultOwnership(
      payload,
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when transferring ownership of the staking vault to a new owner');
  }
};

export const voluntaryDisconnect = async (
  contract: DashboardContract | DelegationContract
) => {
  try {
    const tx = await contract.write.voluntaryDisconnect({
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when disconnecting the staking vault from the vault hub');
  }
};

export const fundWeth = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint]
) => {
  try {
    const tx = await contract.write.fundWeth(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when funding weth');
  }
};

export const withdrawWETH = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, bigint]
) => {
  try {
    const tx = await contract.write.withdrawWETH(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when withdrawing weth');
  }
};

export const requestValidatorExit = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address]
) => {
  try {
    const tx = await contract.write.requestValidatorExit(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when requesting the exit of a validator from the staking vault');
  }
};

export const mintShares = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, bigint]
) => {
  try {
    const tx = await contract.write.mintShares(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when minting shares');
  }
};

export const mintStETH = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, bigint]
) => {
  try {
    const tx = await contract.write.mintStETH(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when minting stETH');
  }
};

export const mintWstETH = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, bigint]
) => {
  try {
    const tx = await contract.write.mintWstETH(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when minting wstETH');
  }
};

export const burnShares = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint]
) => {
  try {
    const tx = await contract.write.burnShares(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when burning shares');
  }
};

export const burnStETH = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint]
) => {
  try {
    const tx = await contract.write.burnStETH(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when burning stETH');
  }
};

export const burnWstETH = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint]
) => {
  try {
    const tx = await contract.write.burnWstETH(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when burning wstETH');
  }
};

export const burnSharesWithPermit = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint, Permit]
) => {
  try {
    const tx = await contract.write.burnSharesWithPermit(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when burning stETH (in shares) using permit');
  }
};

export const burnStETHWithPermit = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint, Permit]
) => {
  try {
    const tx = await contract.write.burnStETHWithPermit(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when burning stETH using permit');
  }
};

export const burnWstETHWithPermit = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint, Permit]
) => {
  try {
    const tx = await contract.write.burnWstETHWithPermit(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when burning wstETH using permit');
  }
};

export const recoverERC20 = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, Address, bigint]
) => {
  try {
    const tx = await contract.write.recoverERC20(
      payload,
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when recovering');
  }
};

export const recoverERC20 = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, Address, bigint]
) => {
  try {
    const tx = await contract.write.recoverERC20(
      payload,
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when recovering ERC20');
  }
};

export const recoverERC721 = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, bigint, Address]
) => {
  try {
    const tx = await contract.write.recoverERC721(
      payload,
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when recovering ERC721');
  }
};

export const pauseBeaconChainDeposits = async (
  contract: DashboardContract | DelegationContract,
) => {
  try {
    const tx = await contract.write.pauseBeaconChainDeposits({
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when pausing deposit');
  }
};

export const resumeBeaconChainDeposits = async (
  contract: DashboardContract | DelegationContract,
) => {
  try {
    const tx = await contract.write.resumeBeaconChainDeposits({
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when resuming deposit');
  }
};

export const grantRoles = async (
  contract: DashboardContract | DelegationContract,
  roleAssignmentJSON: string
) => {
  try {
    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];
    if (!Array.isArray(payload)) {
      throw new Error('the 2nd argument should be an array of role assignments');
    }

    const tx = await contract.write.grantRoles(
      [payload],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when granting role');
  }
};

export const revokeRoles = async (
  contract: DashboardContract | DelegationContract,
  roleAssignmentJSON: string
) => {
  try {
    const payload = JSON.parse(roleAssignmentJSON) as RoleAssignment[];
    if (!Array.isArray(payload)) {
      throw new Error('the 2nd argument should be an array of role assignments');
    }

    const tx = await contract.write.revokeRoles(
      [payload],
      {
        account: getAccount(),
        chain: getChain(),
      }
    );

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when granting role');
  }
};

export const rebalanceVault = async (
  contract: DashboardContract | DelegationContract,
  payload: [bigint]
) => {
  try {
    const tx = await contract.write.rebalanceVault(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when rebalancing vault');
  }
};

export const withdraw = async (
  contract: DashboardContract | DelegationContract,
  payload: [Address, bigint]
) => {
  try {
    const tx = await contract.write.withdraw(payload, {
      account: getAccount(),
      chain: getChain(),
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when withdrawing');
  }
};

export const fund = async (
  contract: DashboardContract | DelegationContract,
  value: bigint,
) => {
  try {
    const tx = await fund({
      account: getAccount(),
      chain: getChain(),
      value,
    });

    console.table({ Transaction: tx });
  } catch (err) {
    printError(err, 'Error when funding');
  }
};
