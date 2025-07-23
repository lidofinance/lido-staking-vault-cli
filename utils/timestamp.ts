export const formatTimestamp = (
  ts: number,
  format = 'dd.mm.yyyy hh:mm',
): string => {
  const d = new Date(ts * 1000);

  return format
    .replace('dd', String(d.getDate()).padStart(2, '0'))
    .replace('mm', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('yyyy', String(d.getFullYear()))
    .replace('hh', String(d.getHours()).padStart(2, '0'))
    .replace('mm', String(d.getMinutes()).padStart(2, '0'));
};
