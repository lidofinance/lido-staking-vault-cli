export type CalculateRebaseRewardArgs = {
  shareRatePrev: bigint;
  shareRateCurr: bigint;
  sharesPrev: bigint;
};

export const calculateRebaseReward = (
  args: CalculateRebaseRewardArgs,
): bigint => {
  const { shareRatePrev, shareRateCurr, sharesPrev } = args;

  // Rebase cost = opening liability shares × change in share rate.
  //
  // Using sharesPrev (opening value) mirrors how calculateLidoAPR uses preShareRate:
  //   lidoAPR      = ΔshareRate / preShareRate
  //   rebaseCost   = sharesPrev × ΔshareRate / 1e27
  //
  // Shares minted mid-period are treated as if they arrived at the START of the
  // next period — their rebase cost appears fully in the following period once
  // they become sharesPrev. This is the standard simple-return convention and
  // keeps vault APR metrics directly comparable to Lido APR.
  return (sharesPrev * (shareRateCurr - shareRatePrev)) / 10n ** 27n;
};
