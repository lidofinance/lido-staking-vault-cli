import { isAbsolute, join, resolve } from "path";
import { homedir } from "os";

export function resolvePath(path: string) {
  return path.startsWith('~')
    ? join(homedir(), path.slice(1))
    : isAbsolute(path)
      ? path
      : resolve(path);
}
