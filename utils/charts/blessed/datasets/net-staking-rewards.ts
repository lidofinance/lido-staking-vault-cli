import { formatTimestamp } from 'utils';

import { LINE_COLORS } from '../constants.js';
import { getAdaptiveLabels, getMinMax } from '../utils.js';

import { BuildChartArgs } from './types.js';

export const buildNetStakingRewardsChart = (args: BuildChartArgs) => {
  const { values, timestamp } = args;

  const y: number[] = [];
  const x: string[] = [];
  const uniqueDays = new Set<string>();

  for (const [i, element] of values.entries()) {
    y.push(Number(element ?? 0));

    const dayLabel = formatTimestamp(timestamp[i] ?? 0, 'dd.mm');
    if (!uniqueDays.has(dayLabel)) {
      x.push(dayLabel);
      uniqueDays.add(dayLabel);
    } else {
      x.push('');
    }
  }

  const safeTimeLabels = x.map((label) =>
    typeof label === 'string' && label.length > 0 ? label : ' ',
  );
  const adaptiveLabels = getAdaptiveLabels(safeTimeLabels);
  const range = getMinMax(y);

  return {
    range,
    dataset: {
      title: 'Net Staking Rewards',
      label: 'netStakingRewards',
      x: adaptiveLabels,
      y,
      style: { line: LINE_COLORS.netStakingRewards },
    },
  };
};
