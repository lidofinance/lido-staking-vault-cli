import Table from 'cli-table3';

export const TABLE_PARAMS: Table.TableConstructorOptions = {
  head: ['Type', 'Value'],
  colAligns: ['left', 'right', 'right'],
  style: { head: ['gray'], compact: true },
};
