import { formatEther } from 'viem';

import {
  VaultReport,
  getBottomLine,
  getGrossStakingAPR,
  getNetStakingAPR,
  getCarrySpread,
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

    bottomLine.push(String(bottomLineValue));
    timestamp.push(current.timestamp);
  }
  return { values: bottomLine, timestamp };
};

export const prepareGrossStakingAPR = (history: VaultReport[]) => {
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

export const prepareNetStakingAPR = (
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

export const prepareCarrySpread = async (
  history: VaultReport[],
  nodeOperatorFeeBPs: bigint[],
  vaultAddress: string,
) => {
  const carrySpreadPercent = [];
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

    const value = getCarrySpread(
      current,
      previous,
      nodeOperatorFeeBPs[i] ?? 0n,
      stEthLiabilityRebaseRewards,
    );

    carrySpreadPercent.push(value.apr_percent);
    timestamp.push(current.timestamp);
  }
  return { values: carrySpreadPercent, timestamp };
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

export const prepareGrossStakingRewards = (history: VaultReport[]) => {
  const grossStakingRewards = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const value = getGrossStakingRewards(current, previous);

    grossStakingRewards.push(String(formatEther(value)));
    timestamp.push(current.timestamp);
  }
  return { values: grossStakingRewards, timestamp };
};

export const prepareNodeOperatorRewards = (
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

    nodeOperatorRewards.push(String(formatEther(value)));
    timestamp.push(current.timestamp);
  }
  return { values: nodeOperatorRewards, timestamp };
};

export const prepareNetStakingRewards = (
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

    netStakingRewards.push(String(formatEther(value)));
    timestamp.push(current.timestamp);
  }
  return { values: netStakingRewards, timestamp };
};
