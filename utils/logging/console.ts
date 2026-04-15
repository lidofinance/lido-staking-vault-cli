import Table, {
  type VerticalTableRow,
  type HorizontalTableRow,
  type CrossTableRow,
  type TableConstructorOptions,
} from 'cli-table3';
import { program } from 'command';

import { getColoredLog, HeadMessage, TABLE_PARAMS } from './constants.js';
import { exportCsv } from '../csv-file.js';
import { isAddress } from 'viem';

type CreateTableArgs = {
  data?: (VerticalTableRow | HorizontalTableRow | CrossTableRow)[];
  params?: TableConstructorOptions;
  csvPath?: string;
  explorerBaseUrl?: string;
};

const bigIntStringify = <T>(value: T): string => {
  return JSON.stringify(
    value,
    (_key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    },
    2,
  );
};

// Flag so that next log can add comma if previous log is JSON to create valid JSON array output
let IS_PREV_JSON_LOG = false;

export const openJsonLogging = () => {
  console.info('[');
};

export const closeJsonLogging = () => {
  console.info(']');
};

export const TEST_RESET_JSON_LOG_FLAG = () => {
  IS_PREV_JSON_LOG = false;
};

export const createConsole = (
  headMessage: HeadMessage,
  type: 'info' | 'error' | 'table' | 'bold' | 'json' = 'info',
) => {
  return <T, U>(...args: T[] | U[]) => {
    // print comma if previous log is JSON to separate logs
    if (IS_PREV_JSON_LOG) {
      console.info(',');
    }
    // set flag so that next log can check if previous log is JSON and print comma
    if (program.opts().json) {
      IS_PREV_JSON_LOG = true;
    }

    switch (type) {
      case 'table': {
        if (program.opts().json) {
          return console.info(bigIntStringify(args));
        }
        console.info(`\n${getColoredLog(headMessage, headMessage + ':')}`);
        return console.table(...args);
      }

      case 'bold': {
        if (program.opts().json) {
          return console.info(bigIntStringify({ result: args }));
        }
        return console.info(getColoredLog(headMessage, args));
      }
      case 'json': {
        for (const arg of args) {
          console.info(bigIntStringify(arg));
        }
        return;
      }
      case 'error':
      case 'info': {
        if (program.opts().json) {
          return console.info(bigIntStringify({ result: args }));
        }
        // eslint-disable-next-line no-console
        return console[type](
          `\n${getColoredLog(headMessage, headMessage + ':')}`,
          ...args,
        );
      }
    }
  };
};

const createEtherscanAddressTerminalLink = (
  address: string,
  scanBaseUrl: string,
) => {
  const url = `${scanBaseUrl}/address/${address}`;
  return `\u001B]8;;${url}\u0007${address}\u001B]8;;\u0007`;
};

const createTable = (headMessage?: HeadMessage) => (args: CreateTableArgs) => {
  const { data, params, csvPath, explorerBaseUrl } = args;
  if (headMessage && !program.opts().json)
    console.info(`\n${getColoredLog(headMessage, headMessage + ':')}`);

  if (!data) return;

  if (program.opts().json) {
    // print comma if previous log is JSON to separate logs
    if (IS_PREV_JSON_LOG) {
      console.info(',');
    }

    IS_PREV_JSON_LOG = true;

    return console.info(bigIntStringify({ result: data }));
  } else {
    const table = new Table({ ...TABLE_PARAMS, ...params });
    let dataToRender = data;
    if (explorerBaseUrl) {
      dataToRender = data.map((row) => {
        if (Array.isArray(row)) {
          row = row.map((cell) => {
            if (
              typeof cell === 'string' &&
              isAddress(cell, { strict: false })
            ) {
              return createEtherscanAddressTerminalLink(cell, explorerBaseUrl);
            }
            return cell;
          });
        }
        return row;
      });
    }

    table.push(...dataToRender);
    console.info(table.toString());
  }

  if (csvPath) {
    exportCsv({
      head: params?.head ?? [],
      data,
      csvPath,
    });
  }
};

export const logResult = createTable('Result');
export const logTable = createTable();
export const logInfo = createConsole('LOG');
export const logError = createConsole('Error', 'error');
export const logBold = createConsole('Bold', 'bold');
export const logCancel = createConsole('Cancel');
export const logResultSimple = createConsole('Result', 'table');
export const logJson = createConsole('Result', 'json');
