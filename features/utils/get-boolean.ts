import { confirmOperation } from 'utils';

export const getBoolean = async (flag: boolean | undefined, name: string) => {
  // if user provided a flag we ask for confirmation
  if (typeof flag === 'boolean') {
    const confirmOption = await confirmOperation(
      `Do you want to set ${name} to ${flag}?`,
    );
    if (confirmOption) return flag;
    // if user does not confirm option we prompt for value
  }
  const confirm = await confirmOperation(`Do you want to enable ${name}?`);
  return confirm;
};
