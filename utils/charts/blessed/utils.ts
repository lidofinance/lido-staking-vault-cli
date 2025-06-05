import { calculateRebaseReward, calculateShareRate } from 'utils';

import { cache } from './cache.js';
import {
  LEGEND_WIDTH,
  LINE_COLORS,
  LINE_STYLE,
  NUM_Y_LABELS,
  SHOW_NTH_LABEL,
  WHOLE_NUMBERS_ONLY,
  XLABEL_PADDING,
  XPADDING,
} from './constants.js';

export const formatTimestamp = (ts: number): string => {
  const d = new Date(ts * 1000);
  // dd.mm
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getMinMax = (arr: number[]) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min;
  const hasFloat = arr.some((v) => !Number.isInteger(v));
  let minY, maxY;
  if (hasFloat) {
    minY = Math.floor((min - range * 0.15) * 10) / 10;
    maxY = Math.ceil((max + range * 0.15) * 10) / 10;
  } else {
    minY = Math.floor(min - range * 0.15);
    maxY = Math.ceil(max + range * 0.15);
  }
  return { min, max, minY, maxY };
};

// Generates X-axis labels: always first and last, others are distributed evenly to avoid overlap
export const getAdaptiveLabels = (labels: string[], minSpacing = 2) => {
  // minSpacing — minimum number of characters between labels
  const termWidth = process.stdout.columns || 80;
  const labelLen = labels[0]?.length || 5;
  const maxLabels = Math.max(
    2,
    Math.floor(termWidth / (labelLen + minSpacing)),
  );
  const n = labels.length;
  if (n <= maxLabels) return labels;
  const result = Array.from({ length: n }, () => ' ');
  result[0] = String(labels[0]);
  result[n - 1] = String(labels[n - 1]);
  const step = (n - 1) / (maxLabels - 1);
  for (let i = 1; i < maxLabels - 1; i++) {
    const idx = Math.round(i * step);
    result[idx] = String(labels[idx]);
  }
  return result;
};

export const lineOpts = (
  {
    label,
    yLabel,
    range,
  }: {
    label: string;
    yLabel: string;
    range: { min: number; max: number; minY: number; maxY: number };
  },
  opts?: { legendNames?: string[]; legendColors?: string[] },
) => {
  const base = {
    label: `${label} (min: ${range.min.toFixed(2)}, max: ${range.max.toFixed(2)})`,
    showLegend: true,
    legend: { width: LEGEND_WIDTH },
    style: {
      line: LINE_COLORS[label as keyof typeof LINE_COLORS] || 'yellow',
      ...LINE_STYLE,
    },
    xLabelPadding: XLABEL_PADDING,
    xPadding: XPADDING,
    wholeNumbersOnly: WHOLE_NUMBERS_ONLY,
    showNthLabel: SHOW_NTH_LABEL,
    yLabel: yLabel,
    minY: range.minY,
    maxY: range.maxY,
    numYLabels: NUM_Y_LABELS,
  };
  if (opts && opts.legendNames && opts.legendColors) {
    return {
      ...base,
      legend: {
        width: LEGEND_WIDTH,
        style:
          opts.legendColors && opts.legendNames
            ? opts.legendColors.reduce(
                (acc, color, i) => {
                  const name = opts.legendNames
                    ? opts.legendNames[i]
                    : undefined;
                  if (name) acc[name] = color;
                  return acc;
                },
                {} as Record<string, string>,
              )
            : {},
      },
    };
  }
  return base;
};

export const getShareRate = async (
  vaultAddress: string,
  blockNumber: number,
): Promise<bigint> => {
  const cached = await cache.getShareRate(vaultAddress, blockNumber);
  if (cached !== null) return cached;
  const shareRate = await calculateShareRate(blockNumber);

  await cache.setShareRate(vaultAddress, blockNumber, shareRate);

  return shareRate;
};

export const getRebaseReward = async (
  vaultAddress: string,
  blockNumberCurr: number,
  blockNumberPrev: number,
  liabilitySharesCurr: bigint,
  liabilitySharesPrev: bigint,
): Promise<bigint> => {
  const cacheKey = `${blockNumberPrev}_${blockNumberCurr}`;
  const cached = await cache.getRebaseReward(vaultAddress, cacheKey);
  if (cached !== null) return cached;

  const shareRatePrev = await getShareRate(vaultAddress, blockNumberPrev);
  const shareRateCurr = await getShareRate(vaultAddress, blockNumberCurr);

  const reward = calculateRebaseReward(
    shareRatePrev,
    shareRateCurr,
    liabilitySharesCurr,
    liabilitySharesPrev,
  );

  await cache.setRebaseReward(vaultAddress, cacheKey, reward);
  return reward;
};
