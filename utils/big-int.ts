export const bigIntMax = (...args: bigint[]) =>
  // eslint-disable-next-line unicorn/prefer-math-min-max
  args.reduce((a, b) => (a > b ? a : b));
export const bigIntMin = (...args: bigint[]) =>
  // eslint-disable-next-line unicorn/prefer-math-min-max
  args.reduce((a, b) => (a < b ? a : b));
