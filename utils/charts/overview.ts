import { formatEther } from 'viem';

interface LiabilityOverview {
  totalValue: bigint;
  stETHLiability: bigint;
  reserveRatioBP: number;
  forceRebalanceThresholdBP: number;
}

export const logLiabilityBar = (
  data: LiabilityOverview,
  barLength = 68,
): void => {
  const totalValueEth = parseFloat(formatEther(data.totalValue));
  const liabilityEth = parseFloat(formatEther(data.stETHLiability));
  const liabilityPercentage = liabilityEth / totalValueEth;

  const reserveRatioPercentage = data.reserveRatioBP / 10000;
  const rebalanceThresholdPercentage = data.forceRebalanceThresholdBP / 10000;

  const liabilityBarLength = Math.round(liabilityPercentage * barLength);
  const RRPosition = barLength - Math.round(reserveRatioPercentage * barLength);
  const FRPosition =
    barLength - Math.round(rebalanceThresholdPercentage * barLength);

  const barArray = ['['];
  for (let i = 0; i < barLength; i++) {
    if (i < liabilityBarLength) barArray.push('=');
    else if (i === FRPosition && i === RRPosition)
      barArray.push('X'); // Совпадение меток
    else if (i === FRPosition || i === RRPosition) barArray.push('|');
    else barArray.push('-');
  }
  barArray.push(']');

  const bar = barArray.join('');

  // Подписи над стрелками
  const labels = Array.from({ length: barLength + 2 }).fill(' ');
  if (FRPosition === RRPosition) labels[FRPosition + 1] = 'X';
  else {
    labels[FRPosition + 1] = 'F';
    labels[RRPosition + 1] = 'R';
  }

  console.info(labels.join(''));
  console.info(bar);
  console.info(` ${'^'.repeat(liabilityBarLength)} Liability\n`);
  console.info(`Liability: ${(liabilityPercentage * 100).toFixed(2)}%`);
  console.info(
    `R - Reserve ratio: ${(reserveRatioPercentage * 100).toFixed(0)}%`,
  );
  console.info(
    `F - Forced rebalance threshold: ${(rebalanceThresholdPercentage * 100).toFixed(0)}%`,
  );
};
