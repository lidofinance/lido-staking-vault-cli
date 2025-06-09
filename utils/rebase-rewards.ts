type CalculateRebaseRewardArgs = {
  shareRatePrev: bigint;
  shareRateCurr: bigint;
  sharesPrev: bigint;
  sharesCurr: bigint;
};

export const calculateRebaseReward = (
  args: CalculateRebaseRewardArgs,
): bigint => {
  const { shareRatePrev, shareRateCurr, sharesPrev, sharesCurr } = args;

  const reward =
    (shareRateCurr * sharesCurr - shareRatePrev * sharesPrev) / 10n ** 27n;

  return reward;
};
