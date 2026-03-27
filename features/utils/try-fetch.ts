export const tryFetchPost = async <TResult = any>(
  url: string,
  body: TResult,
) => {
  let success = false;
  let result = null;
  let error = null;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    });
    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, statusText: ${response.statusText}`,
      );
    }
    result = (await response.json()) as TResult;
    success = true;
  } catch (error_) {
    error = error_;
  }
  return {
    success,
    result,
    error,
  };
};
