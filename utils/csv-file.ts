import fs from 'fs-extra';

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

export const exportCsv = ({
  head,
  data,
  delimiter = ',',
  csvPath,
}: {
  head: string[];
  data: (string[] | object)[];
  delimiter?: string;
  csvPath: string;
}) => {
  try {
    if (!csvPath) throw new Error('CSV path is required');

    const rows: string[][] = [];

    // header
    if (Array.isArray(head)) rows.push(head.map(formatCell));

    // body
    for (const row of data) {
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

    fs.writeFileSync(csvPath, csv);
  } catch (e) {
    throw new Error('CSV export error', { cause: e });
  }
};
