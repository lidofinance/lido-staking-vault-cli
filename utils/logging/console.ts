import { getColoredLog, HeadMessage } from './constants.js';

export const createConsole = (
  headMessage: HeadMessage,
  type: 'info' | 'error' | 'table' = 'info',
) => {
  return <T, U>(...args: T[] | U[]) => {
    if (type === 'table') {
      console.info(`${getColoredLog(headMessage, headMessage + ':')}`);
      console.table(...args);
    } else {
      // eslint-disable-next-line no-console
      console[type](
        `${getColoredLog(headMessage, headMessage + ':')}`,
        ...args,
      );
    }
  };
};

export const logInfo = createConsole('LOG');
export const logError = createConsole('Error', 'error');
export const logResult = createConsole('Result', 'table');
