import { formatEther } from 'viem';

import {
  VaultReport,
  getBottomLine,
  getGrossStakingAPR,
  getNetStakingAPR,
  getEfficiency,
  calculateLidoAPR,
  getGrossStakingRewards,
  getNodeOperatorRewards,
  getNetStakingRewards,
} from 'utils';

import { getRebaseRewardFromCache, getShareRateFromCache } from 'utils';

export const prepareBottomLine = async (
  history: VaultReport[],
  nodeOperatorFeeBPs: bigint[],
  vaultAddress: string,
) => {
  const bottomLine = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const stEthLiabilityRebaseRewards = await getRebaseRewardFromCache({
      vaultAddress,
      blockNumberCurr: current.blockNumber,
      blockNumberPrev: previous.blockNumber,
      liabilitySharesCurr: BigInt(current.data.liabilityShares),
      liabilitySharesPrev: BigInt(previous.data.liabilityShares),
    });

    const bottomLineValue = getBottomLine(
      current,
      previous,
      nodeOperatorFeeBPs[i] ?? 0n,
      stEthLiabilityRebaseRewards,
    );

    bottomLine.push(Number(bottomLineValue));
    timestamp.push(current.timestamp);
  }
  return { values: bottomLine, timestamp };
};

export const prepareGrossStakingAPR = async (history: VaultReport[]) => {
  const grossStakingAPRPercent = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const value = getGrossStakingAPR(current, previous);

    grossStakingAPRPercent.push(value.apr_percent);
    timestamp.push(current.timestamp);
  }
  return { values: grossStakingAPRPercent, timestamp };
};

export const prepareNetStakingAPR = async (
  history: VaultReport[],
  nodeOperatorFeeBPs: bigint[],
) => {
  const netStakingAPRPercent = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];

    if (!current || !previous) continue;

    const value = getNetStakingAPR(
      current,
      previous,
      nodeOperatorFeeBPs[i] ?? 0n,
    );

    netStakingAPRPercent.push(value.apr_percent);
    timestamp.push(current.timestamp);
  }
  return { values: netStakingAPRPercent, timestamp };
};

export const prepareEfficiency = async (
  history: VaultReport[],
  nodeOperatorFeeBPs: bigint[],
  vaultAddress: string,
) => {
  const efficiencyPercent = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const stEthLiabilityRebaseRewards = await getRebaseRewardFromCache({
      vaultAddress,
      blockNumberCurr: current.blockNumber,
      blockNumberPrev: previous.blockNumber,
      liabilitySharesCurr: BigInt(current.data.liabilityShares),
      liabilitySharesPrev: BigInt(previous.data.liabilityShares),
    });

    const value = getEfficiency(
      current,
      previous,
      nodeOperatorFeeBPs[i] ?? 0n,
      stEthLiabilityRebaseRewards,
    );

    efficiencyPercent.push(value.apr_percent);
    timestamp.push(current.timestamp);
  }
  return { values: efficiencyPercent, timestamp };
};

export const prepareLidoAPR = async (history: VaultReport[]) => {
  const lidoAPR = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const preShareRate = Number(
      await getShareRateFromCache(previous.blockNumber),
    );
    const postShareRate = Number(
      await getShareRateFromCache(current.blockNumber),
    );
    const timeElapsed = current.timestamp - previous.timestamp;

    const value = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    lidoAPR.push(value);
    timestamp.push(current.timestamp);
  }
  return { values: lidoAPR, timestamp };
};

export const prepareGrossStakingRewards = async (history: VaultReport[]) => {
  const grossStakingRewards = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const value = getGrossStakingRewards(current, previous);

    grossStakingRewards.push(Number(formatEther(value, 'gwei')));
    timestamp.push(current.timestamp);
  }
  return { values: grossStakingRewards, timestamp };
};

export const prepareNodeOperatorRewards = async (
  history: VaultReport[],
  nodeOperatorFeeBPs: bigint[],
) => {
  const nodeOperatorRewards = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const value = getNodeOperatorRewards(
      current,
      previous,
      nodeOperatorFeeBPs[i] ?? 0n,
    );

    nodeOperatorRewards.push(Number(formatEther(value, 'gwei')));
    timestamp.push(current.timestamp);
  }
  return { values: nodeOperatorRewards, timestamp };
};

export const prepareNetStakingRewards = async (
  history: VaultReport[],
  nodeOperatorFeeBPs: bigint[],
) => {
  const netStakingRewards = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const value = getNetStakingRewards(
      current,
      previous,
      nodeOperatorFeeBPs[i] ?? 0n,
    );

    netStakingRewards.push(Number(formatEther(value, 'gwei')));
    timestamp.push(current.timestamp);
  }
  return { values: netStakingRewards, timestamp };
};
