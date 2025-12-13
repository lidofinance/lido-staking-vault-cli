import { ReadContract } from '../utils';

export const callReadMethodSilent = async <
  T extends ReadContract,
  M extends keyof T['read'] & string,
>(
  contract: T,
  methodName: M,
  ...payload: Parameters<T['read'][M]>
): Promise<ReturnType<T['read'][M]>> => {
  return callReadMethod(contract, methodName, ...payload, {
    silent: true,
  });
};

export const callReadMethod = async <
  T extends ReadContract,
  M extends keyof T['read'] & string,
>(
  contract: T,
  methodName: M,
  ...payload: [...Parameters<T['read'][M]>, { silent?: boolean }?]
): Promise<ReturnType<T['read'][M]>> => {
  try {
    const method = contract.read[methodName];
    return await method?.(...payload);
  } catch (err) {
    throw new Error(
      `Error when calling read method ${methodName}@${contract.address}. Error: ${err}`,
    );
  }
};
