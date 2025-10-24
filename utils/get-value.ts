export const getValueByPath = <T extends Record<string, unknown>>(
  obj: T,
  path: string,
) => {
  const segments = path.split('.');
  let current: unknown = obj;

  for (const segment of segments) {
    if (typeof current === 'object' && current !== null && segment in current) {
      current = (current as T)[segment];
    } else {
      return undefined;
    }
  }

  return current;
};
