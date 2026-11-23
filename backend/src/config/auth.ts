import dotenv from 'dotenv';

dotenv.config();

const configuredSecret = process.env.JWT_SECRET?.trim();

if (
  process.env.NODE_ENV === 'production' &&
  (!configuredSecret || configuredSecret.length < 32)
) {
  throw new Error(
    'Configure JWT_SECRET com pelo menos 32 caracteres em produção.',
  );
}

export const JWT_SECRET = configuredSecret || 'chave_secreta_padrao';
