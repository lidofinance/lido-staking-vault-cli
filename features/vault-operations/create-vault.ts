import { numberPrompt, selectPrompt } from 'utils';

const MIN_CONFIRM_EXPIRY = 24 * 60 * 60;
const MAX_CONFIRM_EXPIRY = 24 * 60 * 60 * 30;

const validateConfirmExpiry = (confirmExpiry: number) => {
  const minInHours = MIN_CONFIRM_EXPIRY / 3600;
  const maxInHours = MAX_CONFIRM_EXPIRY / 3600;

  if (confirmExpiry < minInHours)
    throw new Error(`Confirm expiry must be greater than ${minInHours}`);
  if (confirmExpiry > maxInHours)
    throw new Error(`Confirm expiry must be less than ${maxInHours}`);

  if (confirmExpiry % 1 !== 0)
    throw new Error('Confirm expiry must be a multiple of hours');
};

const validateNodeOperatorFeeRate = (
  nodeOperatorFeeRate: number,
  type: 'basis points' | 'percentage',
) => {
  if (nodeOperatorFeeRate < 0)
    throw new Error('Node operator fee rate must be greater than 0');

  if (type === 'basis points' && nodeOperatorFeeRate > 10000)
    throw new Error('Node operator fee rate must be less than 10000');
  if (type === 'percentage' && nodeOperatorFeeRate > 100)
    throw new Error('Node operator fee rate must be less than 100');

  if (type === 'basis points' && nodeOperatorFeeRate % 100 !== 0)
    throw new Error('Node operator fee rate must be a multiple of 100');

  if (type === 'percentage' && nodeOperatorFeeRate % 1 !== 0)
    throw new Error('Node operator fee rate must be a whole number');
};

export const getConfirmExpiry = async (confirmExpiry?: number) => {
  if (!confirmExpiry) {
    const confirmExpiryValue = await numberPrompt(
      'Enter the confirm expiry (in hours)',
      'value',
    );
    if (!confirmExpiryValue.value) throw new Error('Invalid confirm expiry');

    validateConfirmExpiry(confirmExpiryValue.value);

    return confirmExpiryValue.value;
  }

  validateConfirmExpiry(confirmExpiry);

  return confirmExpiry;
};

export const getNodeOperatorFeeRate = async (nodeOperatorFeeRate?: number) => {
  if (!nodeOperatorFeeRate) {
    const chooseFeeType = await selectPrompt('Choose the fee type', 'feeType', [
      { title: 'basis points', value: 'basis points' },
      { title: 'percentage', value: 'percentage' },
    ]);
    if (!chooseFeeType.feeType) throw new Error('Invalid fee type');

    const nodeOperatorFeeRateValue = await numberPrompt(
      `Enter the node operator fee rate (in ${chooseFeeType.feeType})`,
      'value',
    );
    if (!nodeOperatorFeeRateValue.value)
      throw new Error('Invalid node operator fee rate');

    if (chooseFeeType.feeType === 'basis points') {
      validateNodeOperatorFeeRate(
        nodeOperatorFeeRateValue.value,
        'basis points',
      );
      return nodeOperatorFeeRateValue.value;
    }

    validateNodeOperatorFeeRate(nodeOperatorFeeRateValue.value, 'percentage');

    return nodeOperatorFeeRateValue.value / 100;
  }

  return nodeOperatorFeeRate;
};
