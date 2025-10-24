import path from 'path';
import { homedir } from 'os';

export const resolvePath = (pathString: string) => {
  return pathString.startsWith('~')
    ? path.join(homedir(), pathString.slice(1))
    : path.isAbsolute(pathString)
      ? pathString
      : path.resolve(pathString);
};
