import * as dotenv from "dotenv";

const { parsed } = dotenv.config();

export const envs = parsed;
if (envs) {
  envs.DEPLOYED = envs?.DEPLOYED || (process.env.DEPLOYED as string);
  envs.RPC_URL_1 = envs?.RPC_URL_1 || (process.env.RPC_URL_1 as string);
  envs.RPC_URL_17000 = envs?.RPC_URL_137 || (process.env.RPC_URL_137 as string);

  envs.PRIVATE_KEY_1 =
    envs?.PRIVATE_KEY_1 || (process.env.PRIVATE_KEY_1 as string);
  envs.PRIVATE_KEY_17000 =
    envs?.PRIVATE_KEY_137 || (process.env.PRIVATE_KEY_137 as string);
}
