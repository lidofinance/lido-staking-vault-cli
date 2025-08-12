import Table, {
  type VerticalTableRow,
  type HorizontalTableRow,
  type CrossTableRow,
  type TableConstructorOptions,
} from 'cli-table3';
import { program } from 'command';
import fs from 'fs-extra';

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

const formatCell = (v: unknown): string => {
  if (typeof v === 'bigint') return v.toString();
  if (v === null || v === undefined) return '';
  return String(v);
};

const escapeCsv = (s: string, delimiter: string): string => {
  const needsQuote =
    s.includes(delimiter) ||
    s.includes('"') ||
    s.includes('\n') ||
    s.includes('\r');
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
};

const rowsToCsv = (rows: string[][], delimiter: string): string =>
  rows
    .map((r) => r.map((c) => escapeCsv(c, delimiter)).join(delimiter))
    .join('\n') + '\n';

const createTable = (headMessage?: HeadMessage) => (args: CreateTableArgs) => {
  const { data, params } = args;
  if (headMessage)
    console.info(`\n${getColoredLog(headMessage, headMessage + ':')}`);

  if (!data) return;

  const table = new Table({ ...TABLE_PARAMS, ...params });
  table.push(...data);
  console.info(table.toString());

  // CSV export (optional via --csv)
  try {
    const opts: any = program?.opts?.() ?? {};
    const csvPath: string | undefined = opts.csv;
    if (!csvPath) return;

    const delimiter: string = opts.csvDelimiter ?? ',';
    const rows: string[][] = [];

    // header
    const head = (params as any)?.head as unknown[] | undefined;
    if (Array.isArray(head)) rows.push(head.map(formatCell));

    // body
    for (const row of data as any[]) {
      if (Array.isArray(row)) {
        rows.push(row.map(formatCell));
      } else if (row && typeof row === 'object') {
        rows.push(Object.values(row).map(formatCell));
      } else {
        rows.push([formatCell(row)]);
      }
    }

    const csv = rowsToCsv(rows, delimiter);
    fs.ensureFileSync(csvPath);
    if (opts.csvAppend) {
      fs.appendFileSync(csvPath, csv);
    } else {
      fs.writeFileSync(csvPath, csv);
    }
  } catch (e) {
    // don't break main output on CSV export error
    console.error('CSV export error:', (e as Error).message);
  }
};

export const logResult = createTable('Result');
export const logTable = createTable();
export const logInfo = createConsole('LOG');
export const logError = createConsole('Error', 'error');
export const logBold = createConsole('Bold', 'bold');
export const logCancel = createConsole('Cancel');
export const logResultSimple = createConsole('Result', 'table');
