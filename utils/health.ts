import {
  DelegationContract,
  DashboardContract,
  getStethContract,
} from 'contracts';

export const fetchVaultMetrics = async (
  contract: DashboardContract | DelegationContract,
) => {
  const stethContract = await getStethContract();

  const [valuation, minted, rebalanceThresholdBP] = await Promise.all([
    contract.read.valuation(), // BigInt, in wei
    contract.read.sharesMinted(), // BigInt, in shares
    contract.read.rebalanceThresholdBP(), // number (in basis points)
  ]);

  const mintedInStethWei = await stethContract.read.getPooledEthByShares([
    minted,
  ]); // BigInt

  return {
    valuation,
    minted,
    rebalanceThresholdBP,
    mintedInStethWei,
    stethContract,
  };
};

export const calculateVaultHealth = (
  valuation: bigint,
  mintedInStethWei: bigint,
  rebalanceThresholdBP: number,
) => {
  // Convert everything to BigInt and perform calculations with 1e18 precision
  const BASIS_POINTS_DENOMINATOR = 10_000n;
  const PRECISION = 10n ** 18n;

  const thresholdMultiplier =
    ((BASIS_POINTS_DENOMINATOR - BigInt(rebalanceThresholdBP)) * PRECISION) /
    BASIS_POINTS_DENOMINATOR;
  const adjustedValuation = (valuation * thresholdMultiplier) / PRECISION;

  const healthRatio18 =
    mintedInStethWei > 0n
      ? (adjustedValuation * PRECISION * 100n) / mintedInStethWei
      : Infinity;
  const healthRatio = Number(healthRatio18) / 1e18;

  // Convert to readable format
  const isHealthy = healthRatio >= 100;

  return {
    healthRatio,
    healthRatio18,
    isHealthy,
  };
};

export const fetchAndCalculateVaultHealth = async (
  contract: DashboardContract | DelegationContract,
) => {
  const { valuation, rebalanceThresholdBP, mintedInStethWei, minted } =
    await fetchVaultMetrics(contract);
  const { healthRatio, isHealthy } = calculateVaultHealth(
    valuation,
    mintedInStethWei,
    rebalanceThresholdBP,
  );

  return {
    healthRatio,
    isHealthy,
    valuation,
    mintedInStethWei,
    rebalanceThresholdBP,
    minted,
  };
};

export const fetchAndCalculateVaultHealthWithNewValue = async (
  contract: DashboardContract | DelegationContract,
  newMintedValue: bigint,
  type: 'mint' | 'burn',
) => {
  const {
    valuation,
    rebalanceThresholdBP,
    mintedInStethWei,
    stethContract,
    minted,
  } = await fetchVaultMetrics(contract);
  const isMinting = type === 'mint';

  const newMinted = isMinting
    ? minted + newMintedValue
    : minted - newMintedValue;
  const newMintedInStethWei = await stethContract.read.getPooledEthByShares([
    newMinted,
  ]); // BigInt

  const currentVaultHealth = calculateVaultHealth(
    valuation,
    mintedInStethWei,
    rebalanceThresholdBP,
  );
  const newVaultHealth = calculateVaultHealth(
    valuation,
    newMintedInStethWei,
    rebalanceThresholdBP,
  );

  return {
    currentVaultHealth,
    newVaultHealth,
    valuation,
    mintedInStethWei,
    rebalanceThresholdBP,
    minted,
    newMinted,
    newMintedInStethWei,
  };
};
