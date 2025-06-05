export const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;

export const calculateLidoAPR = (
  preShareRate: number,
  postShareRate: number,
  timeElapsed: number,
): number => {
  if (preShareRate === 0 || timeElapsed === 0) return 0;
  return (
    (100 * SECONDS_IN_YEAR * ((postShareRate - preShareRate) / preShareRate)) /
    timeElapsed
  );
};
