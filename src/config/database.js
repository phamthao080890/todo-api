'use strict';

const { Sequelize } = require('sequelize');

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
} = process.env;

// Build SSL options for remote databases (Aiven, RDS, etc.)
const dialectOptions = {};
if (process.env.DB_SSL === 'true') {
  dialectOptions.ssl = { rejectUnauthorized: true };
  
  // If a CA certificate is provided (e.g., from Aiven), use it
  if (process.env.DB_CA_CERT) {
    dialectOptions.ssl.ca = [process.env.DB_CA_CERT];
  }
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,                  // reduced from 10 for free tier
    min: 0,
    acquire: 60000,          // increased from 30s to 60s for remote DB
    idle: 10000,
    evict: 30000,
  },
  dialectOptions,
});

module.exports = sequelize;
