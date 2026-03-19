export const withError = <T>(
  promise: Promise<T>,
): Promise<{ result: T; error: null } | { result: null; error: unknown }> => {
  return promise
    .then((result) => ({ result, error: null }))
    .catch((error) => ({ result: null, error }));
};
