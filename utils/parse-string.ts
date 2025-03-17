export const parseObjectsArray = (str: string): Record<string, any>[] => {
  const trimmed = str.trim();
  if (!trimmed) {
    return [];
  }

  const parts = trimmed.split('},').map((part) => part.trim());

  const normalizedParts = parts.map((part) => {
    return part.endsWith('}') ? part : part + '}';
  });

  const jsonStrings = normalizedParts.map((chunk) => {
    const withQuotedKeys = chunk.replace(/(\w+)\s*:/g, '"$1":');
    const replacedQuotes = withQuotedKeys.replace(/'/g, '"');

    return replacedQuotes;
  });

  const result = jsonStrings.map((jsonStr) => {
    return JSON.parse(jsonStr);
  });

  return result;
};
