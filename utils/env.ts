// Parse an integer from an env var, falling back when unset or invalid.
export const parseEnvInt = (
  raw: string | undefined,
  fallback: number,
): number => {
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};
