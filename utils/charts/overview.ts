import { formatEther } from 'viem';

interface LiabilityOverview {
  totalValue: bigint;
  stETHLiability: bigint;
  reserveRatioBP: number;
  forceRebalanceThresholdBP: number;
  stETHTotalMintingCapacity: bigint;
}

export const logLiabilityBar = (
  data: LiabilityOverview,
  barLength = 68,
): void => {
  const totalValueEth = parseFloat(formatEther(data.totalValue));
  const liabilitySteth = parseFloat(formatEther(data.stETHLiability));
  const totalMintingCapacitySteth = parseFloat(
    formatEther(data.stETHTotalMintingCapacity),
  );

  const liabilityPercentage = liabilitySteth / totalValueEth;
  const reserveRatioPercentage = data.reserveRatioBP / 10000;
  const rebalanceThresholdPercentage = data.forceRebalanceThresholdBP / 10000;
  const totalMintingCapacityPercentage =
    totalMintingCapacitySteth / totalValueEth;

  const positions = {
    liabilityEnd: Math.round(liabilityPercentage * barLength),
    RR: barLength - Math.round(reserveRatioPercentage * barLength),
    FR: barLength - Math.round(rebalanceThresholdPercentage * barLength),
    TMC: Math.round(totalMintingCapacityPercentage * barLength),
  };

  const barArray = ['['];
  for (let i = 0; i < barLength; i++) {
    if (i === positions.TMC || i === positions.FR || i === positions.RR)
      barArray.push('|');
    else if (i < positions.liabilityEnd) barArray.push('=');
    else barArray.push('-');
  }
  barArray.push(']');

  const bar = barArray.join('');

  const labels = Array.from({ length: barLength + 2 }).fill(' ');
  const collisions: string[] = [];
  const setLabel = (pos: number, char: string) => {
    if (labels[pos] === ' ') labels[pos] = char;
    else {
      const existingChar = labels[pos];
      labels[pos] = 'X';
      collisions.push(`${existingChar}/${char}`);
    }
  };

  setLabel(positions.FR + 1, 'F');
  setLabel(positions.RR + 1, 'R');
  setLabel(positions.TMC + 1, 'T');

  console.info(labels.join(''));
  console.info(bar);
  console.info(` ${'^'.repeat(positions.liabilityEnd)} Liability\n`);
  console.info(`Liability: ${(liabilityPercentage * 100).toFixed(2)}%`);
  console.info(
    `R - Reserve ratio: ${(reserveRatioPercentage * 100).toFixed(0)}%`,
  );
  console.info(
    `F - Forced rebalance threshold: ${(rebalanceThresholdPercentage * 100).toFixed(0)}%`,
  );
  console.info(
    `T - Total minting capacity: ${(totalMintingCapacityPercentage * 100).toFixed(0)}%`,
  );

  if (collisions.length > 0) {
    console.info(
      `X - Collisions: ${collisions.join(', ')} (positions coincide)`,
    );
  }
};

const VAULT_HEALTH_PERCENT_GREEN = 125;
const VAULT_HEALTH_PERCENT_YELLOW = 105;
const VAULT_HEALTH_PERCENT_RED = 100;

export const logVaultHealthBar = (healthFactor: number): void => {
  const totalBarLength = 25;
  const maxHealthFactor = 200;

  const filledLength = Math.round(
    (healthFactor / maxHealthFactor) * totalBarLength,
  );

  let bar = '[';
  for (let i = 0; i < totalBarLength; i++) {
    const positionPercentage = (i / totalBarLength) * maxHealthFactor;

    if (i >= filledLength) {
      bar += '·'; // не заполнено
    } else if (positionPercentage >= VAULT_HEALTH_PERCENT_GREEN) {
      bar += '█'; // зелёная зона
    } else if (positionPercentage >= VAULT_HEALTH_PERCENT_YELLOW) {
      bar += '▓'; // жёлтая зона
    } else if (positionPercentage >= VAULT_HEALTH_PERCENT_RED) {
      bar += '▒'; // красная зона
    } else {
      bar += '░'; // критическая зона ниже 100%
    }
  }
  bar += ']';

  const statusEmoji =
    healthFactor >= VAULT_HEALTH_PERCENT_GREEN
      ? '🟢'
      : healthFactor >= VAULT_HEALTH_PERCENT_YELLOW
        ? '🟡'
        : healthFactor >= VAULT_HEALTH_PERCENT_RED
          ? '🔴'
          : '🔥';

  console.info('Vault Health');
  console.info(`${bar} ${healthFactor}% ${statusEmoji}`);
};
