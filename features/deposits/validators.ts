import { formatEther, Hex } from 'viem';
import { confirmOperation, logError, logInfo } from 'utils';

type ValidatorInfo = {
  pubkey: Hex;
  effectiveBalance: number;
  activationEpoch: number;
  slashed: boolean;
};

const MIN_EFFECTIVE_BALANCE_GWEI = 32000000000;
const NOT_ACTIVATED_EPOCH = Infinity;

export const checkValidatorInfo = async (validator: ValidatorInfo) => {
  let message = '';
  let isValid = true;
  if (validator.effectiveBalance < MIN_EFFECTIVE_BALANCE_GWEI) {
    message += `Validator effective balance is less than ${formatEther(BigInt(MIN_EFFECTIVE_BALANCE_GWEI), 'gwei')} ETH (current: ${formatEther(BigInt(validator.effectiveBalance), 'gwei')} ETH)\n`;
    isValid = false;
  }

  if (validator.activationEpoch === NOT_ACTIVATED_EPOCH) {
    message += `Validator is not activated. (activationEpoch: ${validator.activationEpoch})\n`;
    isValid = false;
  }

  if (validator.slashed) {
    message += `Validator is slashed. (slashed: ${validator.slashed})\n`;
    isValid = false;
  }

  logError(message);

  const confirm = await confirmOperation(
    `Do you want to skip this validator (pubkey: ${validator.pubkey})?`,
  );

  if (!confirm) {
    throw new Error('Operation cancelled');
  }

  if (!isValid) {
    logInfo('Validator is not valid. Skipping...');
  }

  return { isValid, skip: confirm };
};
