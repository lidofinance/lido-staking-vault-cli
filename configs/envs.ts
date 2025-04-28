import * as dotenv from 'dotenv';

const { parsed } = dotenv.config();

export const envs = structuredClone(parsed);
if (envs) {
  envs.DEPLOYED = (process.env.DEPLOYED as string) ?? envs?.DEPLOYED;
  envs.PRIVATE_KEY = (process.env.PRIVATE_KEY as string) ?? envs?.PRIVATE_KEY;
  envs.ACCOUNT_FILE =
    (process.env.ACCOUNT_FILE as string) ?? envs?.ACCOUNT_FILE;
  envs.ACCOUNT_FILE_PASSWORD =
    (process.env.ACCOUNT_FILE_PASSWORD as string) ??
    envs?.ACCOUNT_FILE_PASSWORD;
  envs.CL_URL = (process.env.CL_URL as string) ?? envs?.CL_URL;
  envs.EL_URL = (process.env.EL_URL as string) ?? envs?.EL_URL;
  envs.CHAIN_ID = (process.env.CHAIN_ID as string) ?? envs?.CHAIN_ID;
}
