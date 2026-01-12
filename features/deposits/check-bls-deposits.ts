import { callReadMethod, isValidBLSDeposit } from 'utils';
import { PredepositGuaranteeContract, StakingVaultContract } from 'contracts';
import { Deposit } from 'types';

export const checkBLSDeposits = async (
  vaultContract: StakingVaultContract,
  deposits: Deposit[],
) => {
  const withdrawalCredentials = await callReadMethod({
    contract: vaultContract,
    methodName: 'withdrawalCredentials',
    payload: [],
  });

  for (const deposit of deposits) {
    const isBLSValid = await isValidBLSDeposit(deposit, withdrawalCredentials);

    if (!isBLSValid) {
      throw new Error(
        `❌ Offchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
      );
    }
  }
};

export const checkBLSWithAmountDeposits = async (
  pdgContract: PredepositGuaranteeContract,
  vaultContract: StakingVaultContract,
  deposits: Deposit[],
) => {
  const PREDEPOSIT_AMOUNT = await callReadMethod({
    contract: pdgContract,
    methodName: 'PREDEPOSIT_AMOUNT',
    payload: [],
  });
  const withdrawalCredentials = await callReadMethod({
    contract: vaultContract,
    methodName: 'withdrawalCredentials',
    payload: [],
  });

  for (const deposit of deposits) {
    const isBLSValid = await isValidBLSDeposit(deposit, withdrawalCredentials);

    if (deposit.amount !== PREDEPOSIT_AMOUNT) {
      throw new Error(
        `❌ Deposit amount is not equal to PREDEPOSIT_AMOUNT for pubkey ${deposit.pubkey}`,
      );
    }
    if (!isBLSValid) {
      throw new Error(
        `❌ Offchain - BLS signature is not valid for Pubkey ${deposit.pubkey}`,
      );
    }
  }
};
