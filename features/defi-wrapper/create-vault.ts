import { getOperatorGridContract } from 'contracts';
import { callReadMethodSilent, numberPrompt, textPrompt } from 'utils';

const MIN_TIME_IN_HOURS = 60 * 60; // 1 hour
const MAX_TIME_IN_HOURS = 24 * 60 * 60 * 30; // 30 days

const MAX_POOL_TOKEN_NAME_LENGTH = 14;
const MIN_POOL_TOKEN_NAME_LENGTH = 3;

const MAX_POOL_TOKEN_SYMBOL_LENGTH = 8;
const MIN_POOL_TOKEN_SYMBOL_LENGTH = 3;

const MAX_BASIS_POINTS = 10000;

/**
 * Validate the pool token symbol
 * @param symbol - The pool token symbol
 * @throws Error if the pool token symbol is invalid
 */
const validatePoolTokenSymbol = (symbol: string) => {
  if (symbol.length < MIN_POOL_TOKEN_SYMBOL_LENGTH)
    throw new Error(
      `Pool token symbol must be at least ${MIN_POOL_TOKEN_SYMBOL_LENGTH} characters long`,
    );
  if (symbol.length > MAX_POOL_TOKEN_SYMBOL_LENGTH)
    throw new Error(
      `Pool token symbol must be less than ${MAX_POOL_TOKEN_SYMBOL_LENGTH} characters long`,
    );
};

/**
 * Validate the pool token name
 * @param name - The pool token name
 * @throws Error if the pool token name is invalid
 */
const validatePoolTokenName = (name: string) => {
  if (name.length < MIN_POOL_TOKEN_NAME_LENGTH)
    throw new Error(
      `Pool token name must be at least ${MIN_POOL_TOKEN_NAME_LENGTH} characters long`,
    );
  if (name.length > MAX_POOL_TOKEN_NAME_LENGTH)
    throw new Error(
      `Pool token name must be less than ${MAX_POOL_TOKEN_NAME_LENGTH} characters long`,
    );
};

/**
 * Validate the time in hours
 * @param timeInHours - The time in hours
 * @param name - The name of the time
 * @throws Error if the time is invalid
 */
const validateTimeInHours = (timeInHours: number, name: string) => {
  const minInHours = MIN_TIME_IN_HOURS / 3600;
  const maxInHours = MAX_TIME_IN_HOURS / 3600;

  if (timeInHours < minInHours)
    throw new Error(
      `${name} must be greater than ${minInHours} hours. Current value: ${timeInHours} hours (${timeInHours * 3600} seconds)`,
    );
  if (timeInHours > maxInHours)
    throw new Error(
      `${name} must be less than ${maxInHours} hours. Current value: ${timeInHours} hours (${timeInHours * 3600} seconds)`,
    );

  if (timeInHours % 1 !== 0)
    throw new Error(`${name} must be a multiple of hours`);
};

/**
 * Get the min withdrawal delay time
 * @param minWithdrawalDelayTime - The min withdrawal delay time
 * @returns The min withdrawal delay time in seconds
 */
export const getMinWithdrawalDelayTime = async (
  minWithdrawalDelayTime?: number,
): Promise<number> => {
  if (!minWithdrawalDelayTime) {
    const minWithdrawalDelayTimeValue = await numberPrompt(
      `Enter the min withdrawal delay time (in hours) (min: ${MIN_TIME_IN_HOURS / 3600} hours, max: ${MAX_TIME_IN_HOURS / 3600} hours)`,
      'value',
    );
    if (!minWithdrawalDelayTimeValue.value)
      throw new Error('Invalid min withdrawal delay time');

    validateTimeInHours(
      minWithdrawalDelayTimeValue.value,
      'Min withdrawal delay time',
    );

    return minWithdrawalDelayTimeValue.value * 3600;
  }

  validateTimeInHours(
    minWithdrawalDelayTime / 3600,
    'Min withdrawal delay time',
  );

  return minWithdrawalDelayTime;
};

/**
 * Get the min delay seconds
 * @param minDelaySeconds - The min delay seconds
 * @returns The min delay seconds in seconds
 */
export const getMinDelaySeconds = async (
  minDelaySeconds?: number,
): Promise<number> => {
  if (!minDelaySeconds) {
    const minDelaySecondsValue = await numberPrompt(
      `Enter the min delay seconds (min: ${MIN_TIME_IN_HOURS / 3600} hours, max: ${MAX_TIME_IN_HOURS / 3600} hours)`,
      'value',
    );
    if (!minDelaySecondsValue.value)
      throw new Error('Invalid min delay seconds');

    validateTimeInHours(minDelaySecondsValue.value, 'Min delay seconds');

    return minDelaySecondsValue.value * 3600;
  }

  validateTimeInHours(minDelaySeconds / 3600, 'Min delay seconds');

  return minDelaySeconds;
};

export const getPoolTokenName = async (name?: string): Promise<string> => {
  if (!name) {
    const nameValue = await textPrompt(
      `Enter the pool token name (min: ${MIN_POOL_TOKEN_NAME_LENGTH} characters, max: ${MAX_POOL_TOKEN_NAME_LENGTH} characters)`,
      'value',
    );
    if (!nameValue.value) throw new Error('Invalid pool token name');

    validatePoolTokenName(nameValue.value);

    return nameValue.value;
  }

  validatePoolTokenName(name);

  return name;
};

export const getPoolTokenSymbol = async (symbol?: string): Promise<string> => {
  if (!symbol) {
    const symbolValue = await textPrompt(
      `Enter the pool token symbol (min: ${MIN_POOL_TOKEN_SYMBOL_LENGTH} characters, max: ${MAX_POOL_TOKEN_SYMBOL_LENGTH} characters)`,
      'value',
    );
    if (!symbolValue.value) throw new Error('Invalid pool token symbol');

    validatePoolTokenSymbol(symbolValue.value);

    return symbolValue.value;
  }

  validatePoolTokenSymbol(symbol);

  return symbol;
};

export const getReserveRatioGapBP = async (
  reserveRatioGapBP?: number,
): Promise<number> => {
  if (!reserveRatioGapBP) {
    const reserveRatioGapBPValue = await numberPrompt(
      `Enter the reserve ratio gap (in basis points) (max: ${MAX_BASIS_POINTS} basis points)`,
      'value',
    );
    if (!reserveRatioGapBPValue.value)
      throw new Error('Invalid reserve ratio gap');

    await validateReserveRatioGapBP(reserveRatioGapBPValue.value);

    return reserveRatioGapBPValue.value;
  }

  await validateReserveRatioGapBP(reserveRatioGapBP);

  return reserveRatioGapBP;
};

const validateReserveRatioGapBP = async (reserveRatioGapBP: number) => {
  const operatorGrid = await getOperatorGridContract();
  const defaultTier = await callReadMethodSilent(operatorGrid, 'tier', [0n]);

  if (!defaultTier)
    throw new Error(
      'Default tier not found. Cannot validate reserve ratio gap.',
    );

  const { reserveRatioBP } = defaultTier;
  const expectedResult = reserveRatioBP + reserveRatioGapBP;

  if (expectedResult > MAX_BASIS_POINTS)
    throw new Error(
      `Reserve ratio gap must be less than ${MAX_BASIS_POINTS - reserveRatioBP} basis points. Current value: ${reserveRatioGapBP}`,
    );
};
