export const calculateHealthRatio = (
  valuation: bigint,
  mintedInSteth: bigint,
  rebalanceThresholdBP: number,
) => {
  // Convert everything to BigInt and perform calculations with 1e18 precision
  const BASIS_POINTS_DENOMINATOR = 10_000n;
  const PRECISION = 10n ** 18n;

  const thresholdMultiplier =
    ((BASIS_POINTS_DENOMINATOR - BigInt(rebalanceThresholdBP)) * PRECISION) /
    BASIS_POINTS_DENOMINATOR;
  const adjustedValuation = (valuation * thresholdMultiplier) / PRECISION;
  const healthRatio =
    (adjustedValuation * 100n * PRECISION) / mintedInSteth / PRECISION;

  // Convert to readable format
  const healthRatioNumber = Number(healthRatio) / 1e18;
  const isHealthy = healthRatioNumber >= 100n;

  return {
    healthRatio,
    healthRatioNumber,
    isHealthy,
  };
};
