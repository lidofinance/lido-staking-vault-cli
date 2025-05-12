import Table, {
  type VerticalTableRow,
  type HorizontalTableRow,
  type CrossTableRow,
  type TableConstructorOptions,
} from 'cli-table3';

import { getColoredLog, HeadMessage, TABLE_PARAMS } from './constants.js';

type CreateTableArgs = {
  data?: (VerticalTableRow | HorizontalTableRow | CrossTableRow)[];
  params?: TableConstructorOptions;
};

export const createConsole = (
  headMessage: HeadMessage,
  type: 'info' | 'error' | 'table' | 'bold' = 'info',
) => {
  return <T, U>(...args: T[] | U[]) => {
    switch (type) {
      case 'table':
        console.info(`\n${getColoredLog(headMessage, headMessage + ':')}`);
        console.table(...args);
        break;
      case 'bold':
        console.info(getColoredLog(headMessage, args));
        break;
      default:
        // eslint-disable-next-line no-console
        console[type](
          `\n${getColoredLog(headMessage, headMessage + ':')}`,
          ...args,
        );
    }
  };
};

const createTable = (headMessage?: HeadMessage) => (args: CreateTableArgs) => {
  const { data, params } = args;
  if (headMessage)
    console.info(`\n${getColoredLog(headMessage, headMessage + ':')}`);

  if (!data) return;

  const table = new Table({ ...TABLE_PARAMS, ...params });
  table.push(...data);
  console.info(table.toString());
};

export const logResult = createTable('Result');
export const logTable = createTable();
export const logInfo = createConsole('LOG');
export const logError = createConsole('Error', 'error');
export const logBold = createConsole('Bold', 'bold');
export const logCancel = createConsole('Cancel');
export const logResultSimple = createConsole('Result', 'table');
