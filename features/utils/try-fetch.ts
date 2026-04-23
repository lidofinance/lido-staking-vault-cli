const ALLOWED_SCHEMES = new Set(['http:', 'https:']);

const assertSafeUrl = (url: string): void => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
    throw new Error(
      `Unsupported URL scheme "${parsed.protocol}" (only http/https allowed)`,
    );
  }
};

export const tryFetchPost = async <TResult = any>(
  url: string,
  body: TResult,
) => {
  let success = false;
  let result = null;
  let error = null;
  try {
    assertSafeUrl(url);
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
