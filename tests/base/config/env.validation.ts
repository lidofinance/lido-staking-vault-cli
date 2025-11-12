import path from 'path';

import { z } from 'zod';
import { config as envConfig } from 'dotenv';

const envSchema = z.object({
  CHAIN_ID: z.string(),
});

envConfig({ path: path.resolve(__dirname, '../.env') });
class LsvCliEnvs {
  CHAIN_ID!: string;

  constructor() {
    this.validateEnv();
  }

  private validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      throw new Error(
        `.env validation error for test run: ${JSON.stringify(
          result.error.format(),
        )}`,
      );
    }

    const validatedEnv = result.data;

    this.CHAIN_ID = validatedEnv.CHAIN_ID;
  }
}

export const ENV_CONFIG = new LsvCliEnvs();
