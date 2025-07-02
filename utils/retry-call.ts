import { logInfo } from 'utils';

export const retryCall = async (
  fn: () => Promise<any>,
  retries = 5,
  delay = 2000,
) => {
  while (retries > 0) {
    try {
      return await fn();
    } catch (error) {
      logInfo(`Failed, retrying in ${delay}ms...`);
      logInfo(error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries--;
    }
  }
};
