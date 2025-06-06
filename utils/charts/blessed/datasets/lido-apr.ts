import { LINE_COLORS } from '../constants.js';
import { formatTimestamp, getAdaptiveLabels, getMinMax } from '../utils.js';

import { BuildChartArgs } from './types.js';

export const buildLidoAPRChart = (args: BuildChartArgs) => {
  const { values, timestamp } = args;

  const y: number[] = [];
  const x: string[] = [];
  const uniqueDays = new Set<string>();

  for (const [i, element] of values.entries()) {
    y.push(Number(element ?? 0));
    const dayLabel = formatTimestamp(timestamp[i] ?? 0);

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
      title: 'Lido APR',
      label: 'lidoAPR',
      x: adaptiveLabels,
      y,
      style: { line: LINE_COLORS.lidoAPR },
    },
  };
};
