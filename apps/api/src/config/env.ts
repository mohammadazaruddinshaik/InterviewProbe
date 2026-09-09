import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
};

export function getJwtSecret(): string {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return env.jwtSecret;
}

export function validateEnvironment(): void {
  getJwtSecret();
}
