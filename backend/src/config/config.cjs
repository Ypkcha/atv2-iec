require('dotenv').config();

const isSSL = process.env.DB_SSL === 'true';

const postgres = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  dialectOptions: isSSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

module.exports = {
  development: { ...postgres, password: process.env.DB_PASSWORD || 'postgres' },
  production: postgres,
};
