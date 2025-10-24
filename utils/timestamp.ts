export const formatTimestamp = (
  ts: number,
  format = 'dd.mm.yyyy hh:mm',
  timeZone = 'UTC',
): string => {
  const d = new Date(ts * 1000);

  if (timeZone === 'UTC') {
    d.setHours(d.getHours() + d.getTimezoneOffset() / 60);
  } else {
    d.setHours(d.getHours());
  }

  const date = format
    .replace('dd', String(d.getDate()).padStart(2, '0'))
    .replace('mm', String(d.getMonth() + 1).padStart(2, '0'))
    .replace('yyyy', String(d.getFullYear()))
    .replace('hh', String(d.getHours()).padStart(2, '0'))
    .replace('mm', String(d.getMinutes()).padStart(2, '0'));

  return `${date} ${timeZone}`;
};
