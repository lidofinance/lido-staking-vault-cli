import { formatEther } from 'viem';

import {
  VaultReport,
  getBottomLine,
  getGrossStakingAPR,
  getNetStakingAPR,
  getCarrySpread,
  calculateLidoAPR,
  getGrossStakingRewards,
  getNetStakingRewards,
  getDailyLidoFees,
  getNodeOperatorFeeForPeriod,
  NOFeeSnapshot,
  EMPTY_NO_FEE_SNAPSHOT,
  getRebaseRewardFromCache,
  getShareRateFromCache,
} from 'utils';

const snapshotAt = (
  noFeeSnapshots: NOFeeSnapshot[],
  i: number,
): NOFeeSnapshot => noFeeSnapshots[i] ?? EMPTY_NO_FEE_SNAPSHOT;

export const prepareBottomLine = async (
  history: VaultReport[],
  noFeeSnapshots: NOFeeSnapshot[],
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
      liabilitySharesPrev: BigInt(previous.data.liabilityShares),
    });

    const bottomLineValue = getBottomLine(
      current,
      previous,
      snapshotAt(noFeeSnapshots, i),
      snapshotAt(noFeeSnapshots, i - 1),
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
  noFeeSnapshots: NOFeeSnapshot[],
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
      snapshotAt(noFeeSnapshots, i),
      snapshotAt(noFeeSnapshots, i - 1),
    );

    netStakingAPRPercent.push(value.apr_percent);
    timestamp.push(current.timestamp);
  }
  return { values: netStakingAPRPercent, timestamp };
};

export const prepareCarrySpread = async (
  history: VaultReport[],
  noFeeSnapshots: NOFeeSnapshot[],
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
      liabilitySharesPrev: BigInt(previous.data.liabilityShares),
    });

    const value = getCarrySpread(
      current,
      previous,
      snapshotAt(noFeeSnapshots, i),
      snapshotAt(noFeeSnapshots, i - 1),
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
  noFeeSnapshots: NOFeeSnapshot[],
) => {
  const nodeOperatorRewards = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const value = getNodeOperatorFeeForPeriod(
      snapshotAt(noFeeSnapshots, i),
      snapshotAt(noFeeSnapshots, i - 1),
    );

    nodeOperatorRewards.push(String(formatEther(value)));
    timestamp.push(current.timestamp);
  }
  return { values: nodeOperatorRewards, timestamp };
};

export const prepareNetStakingRewards = (
  history: VaultReport[],
  noFeeSnapshots: NOFeeSnapshot[],
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
      snapshotAt(noFeeSnapshots, i),
      snapshotAt(noFeeSnapshots, i - 1),
    );

    netStakingRewards.push(String(formatEther(value)));
    timestamp.push(current.timestamp);
  }
  return { values: netStakingRewards, timestamp };
};

export const prepareDailyLidoFees = (history: VaultReport[]) => {
  const dailyLidoFees = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const value = getDailyLidoFees(current, previous);

    dailyLidoFees.push(String(formatEther(value)));
    timestamp.push(current.timestamp);
  }
  return { values: dailyLidoFees, timestamp };
};
