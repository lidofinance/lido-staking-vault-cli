// Console line chart for metrics

const ALMOST_ZERO_THRESHOLD = 1e-6;

// Returns min and max for an array, with a fallback if all values are equal
const getMinMax = function (values: number[]) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  return { min, max };
};

/**
 * Draws a line chart in the console for a given array of values.
 * If all values are almost the same or close to zero, draws a single line in the center.
 */
export const logLineChart = function (
  values: number[],
  {
    label,
    height = 15,
    width = 60,
    valueLabel = '',
    timeLabels,
    pointSpacing = 3,
  }: {
    label: string;
    height?: number;
    width?: number;
    valueLabel?: string;
    timeLabels?: string[];
    pointSpacing?: number;
  },
) {
  if (values.length === 0) {
    console.info(`${label}: No data`);
    return;
  }
  const { min, max } = getMinMax(values);
  const range = max - min;
  const step = Math.max(1, Math.floor(values.length / width));
  const points = values.filter((_, i) => i % step === 0);
  const chartWidth = points.length * pointSpacing - (pointSpacing - 1);
  const isAllAlmostZero = values.every(
    (v) => Math.abs(v) < ALMOST_ZERO_THRESHOLD,
  );

  // Helper to create an empty chart
  const createEmptyChart = () =>
    Array.from({ length: height }, () =>
      Array.from({ length: chartWidth }, () => ' '),
    );

  let chart: string[][];
  if (range < ALMOST_ZERO_THRESHOLD || isAllAlmostZero) {
    // Draw a single line in the center if all values are almost the same or close to zero
    const center = Math.floor((height - 1) / 2);
    chart = createEmptyChart();
    for (let x = 0; x < points.length; x++) {
      const x0 = x * pointSpacing;
      if (chart[center] && x0 < chart[center].length) chart[center][x0] = '•';
    }
    console.info('(all values ≈ 0, center line)');
  } else {
    // Normal mode: scale values to chart height
    const scaled = points.map((v) =>
      Math.round(((v - min) / (max - min)) * (height - 1)),
    );
    chart = createEmptyChart();
    for (let x = 1; x < points.length; x++) {
      const x0 = (x - 1) * pointSpacing;
      const x1 = x * pointSpacing;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const y0 = height - 1 - scaled[x - 1]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const y1 = height - 1 - scaled[x]!;
      if (chart[y0] && y0 >= 0 && y0 < height && x0 < chart[y0].length)
        chart[y0][x0] = '•';
      // Draw a line between points
      const dx = x1 - x0;
      const dy = y1 - y0;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      for (let s = 1; s <= steps; s++) {
        const y = Math.round(y0 + (dy * s) / steps);
        const xi = x0 + Math.round((dx * s) / steps);
        if (
          chart[y] &&
          y >= 0 &&
          y < height &&
          xi >= 0 &&
          xi < chart[y].length
        ) {
          chart[y][xi] = '•';
        }
      }
    }
    // Draw the last point
    const lastX = (points.length - 1) * pointSpacing;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastY = height - 1 - scaled[points.length - 1]!;
    if (
      chart[lastY] &&
      lastY >= 0 &&
      lastY < height &&
      lastX < chart[lastY].length
    )
      chart[lastY][lastX] = '•';
  }

  // Convert chart to string rows
  const chartRows = chart.map((row) => row.join(''));
  console.info(`${label}${valueLabel ? ' (' + valueLabel + ')' : ''}`);
  for (let i = 0; i < height; i++) {
    const yValue = max - ((max - min) * i) / (height - 1);
    console.info(`${yValue.toFixed(2).padStart(8)} | ${chartRows[i]}`);
  }
  // X axis
  if (chart[0] && chart[0].length > 0) {
    console.info('         ' + '-'.repeat(chart[0].length));
    let axisRow = '         ';
    for (let i = 0; i < points.length; i++) {
      axisRow += '|'.padEnd(pointSpacing, ' ');
    }
    console.info(axisRow);
  }
  // Time or index labels
  if (timeLabels && timeLabels.length > 0) {
    const labelStep = Math.ceil(points.length / 6); // max 6 labels
    let timeRow = '         ';
    for (let i = 0; i < points.length; i++) {
      if (i % labelStep === 0 && timeLabels[i * step]) {
        const label = timeLabels[i * step]?.slice(0, pointSpacing * 2 - 1);
        timeRow += label?.padEnd(pointSpacing, ' ');
      } else {
        timeRow += ''.padEnd(pointSpacing, ' ');
      }
    }
    console.info(timeRow);
  } else {
    let idxRow = '         ';
    for (let i = 0; i < points.length; i++) {
      idxRow += (i % 5 === 0 ? String(i).padStart(2, ' ') : '  ').padEnd(
        pointSpacing,
        ' ',
      );
    }
    console.info(idxRow);
  }
};

export const logGrossStakingAPRChart = function (
  values: number[],
  timeLabels?: string[],
  pointSpacing = 3,
) {
  logLineChart(values, {
    label: 'Gross Staking APR',
    valueLabel: '%',
    height: 15,
    width: 60,
    timeLabels,
    pointSpacing,
  });
};
export const logNetStakingAPRChart = function (
  values: number[],
  timeLabels?: string[],
  pointSpacing = 3,
) {
  logLineChart(values, {
    label: 'Net Staking APR',
    valueLabel: '%',
    height: 15,
    width: 60,
    timeLabels,
    pointSpacing,
  });
};
export const logBottomLineChart = function (
  values: number[],
  timeLabels?: string[],
  pointSpacing = 3,
) {
  logLineChart(values, {
    label: 'Bottom Line',
    valueLabel: 'ETH',
    height: 15,
    width: 60,
    timeLabels,
    pointSpacing,
  });
};
export const logCarrySpreadChart = function (
  values: number[],
  timeLabels?: string[],
  pointSpacing = 3,
) {
  logLineChart(values, {
    label: 'Carry Spread',
    valueLabel: '%',
    height: 15,
    width: 60,
    timeLabels,
    pointSpacing,
  });
};
