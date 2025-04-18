import { getColoredLog, HeadMessage } from './constants.js';

export const createConsole = (
  headMessage: HeadMessage,
  type: 'info' | 'error' | 'table' | 'bold' = 'info',
) => {
  return <T, U>(...args: T[] | U[]) => {
    switch (type) {
      case 'table':
        console.info(`${getColoredLog(headMessage, headMessage + ':')}`);
        console.table(...args);
        break;
      case 'bold':
        console.info(getColoredLog(headMessage, args));
        break;
      default:
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
export const logBold = createConsole('Bold', 'bold');
export const logCancel = createConsole('Cancel');
