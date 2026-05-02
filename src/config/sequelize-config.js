'use strict';

/**
 * Sequelize CLI config — reads the same env vars used at runtime.
 * Run `cp .env.example .env` and fill in values before running migrations.
 */

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_migrations',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_migrations',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    migrationStorageTableName: 'sequelize_migrations',
    logging: false,
    dialectOptions: process.env.DB_SSL === 'true'
      ? {
          ssl: {
            rejectUnauthorized: true,
            // Include CA certificate if provided (for Aiven/managed databases)
            ...(process.env.DB_CA_CERT && { ca: [process.env.DB_CA_CERT] }),
          },
        }
      : {},
  },
};
