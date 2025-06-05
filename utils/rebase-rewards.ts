export const calculateRebaseReward = (
  shareRatePrev: bigint,
  shareRateCurr: bigint,
  sharesCurr: bigint,
  sharesPrev: bigint,
): bigint => {
  const reward =
    (shareRateCurr * sharesCurr - shareRatePrev * sharesPrev) / 10n ** 27n;

  return reward;
};
