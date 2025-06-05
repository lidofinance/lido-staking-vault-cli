import {
  VaultReport,
  getBottomLine,
  getGrossStakingAPR,
  getNetStakingAPR,
  getEfficiency,
  calculateLidoAPR,
} from 'utils';

import { getRebaseReward, getShareRate } from '../utils.js';

export const prepareBottomLine = async (
  history: VaultReport[],
  nodeOperatorFeeBP: bigint,
) => {
  const bottomLine = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const stEthLiabilityRebaseRewards = await getRebaseReward(
      current.blockNumber,
      previous.blockNumber,
      BigInt(current.data.liability_shares),
      BigInt(previous.data.liability_shares),
    );

    const bottomLineValue = getBottomLine(
      current,
      previous,
      nodeOperatorFeeBP,
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
  nodeOperatorFeeBP: bigint,
) => {
  const netStakingAPRPercent = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];

    if (!current || !previous) continue;

    const value = getNetStakingAPR(current, previous, nodeOperatorFeeBP);

    netStakingAPRPercent.push(value.apr_percent);
    timestamp.push(current.timestamp);
  }
  return { values: netStakingAPRPercent, timestamp };
};

export const prepareEfficiency = async (
  history: VaultReport[],
  nodeOperatorFeeBP: bigint,
) => {
  const efficiencyPercent = [];
  const timestamp = [];

  for (let i = 1; i < history.length; i++) {
    const current = history[i];
    const previous = history[i - 1];
    if (!current || !previous) continue;

    const stEthLiabilityRebaseRewards = await getRebaseReward(
      current.blockNumber,
      previous.blockNumber,
      BigInt(current.data.liability_shares),
      BigInt(previous.data.liability_shares),
    );

    const value = getEfficiency(
      current,
      previous,
      nodeOperatorFeeBP,
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

    const preShareRate = Number(await getShareRate(previous.blockNumber));
    const postShareRate = Number(await getShareRate(current.blockNumber));
    const timeElapsed = current.timestamp - previous.timestamp;

    const value = calculateLidoAPR(preShareRate, postShareRate, timeElapsed);

    lidoAPR.push(value);
    timestamp.push(current.timestamp);
  }
  return { values: lidoAPR, timestamp };
};
