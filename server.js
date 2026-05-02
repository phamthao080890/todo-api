'use strict';

require('dotenv').config();

// ── Required environment variable validation ──────────────────────────────────
// Fail fast before any module loads to surface misconfiguration immediately.
const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const app = require('./app');
const { sequelize } = require('./src/models');
const { runMigrations } = require('./src/config/migrations');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      await runMigrations(sequelize);
    } else {
      // In development: sync schema automatically for convenience.
      // In production: schema is managed exclusively by migrations (db:migrate).
      // Running sync({ alter }) in production risks data loss on column changes.
      await sequelize.sync({ alter: true });
      console.log('Database models synced (development only).');
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });

    // ── Graceful shutdown ───────────────────────────────────────────────────
    // 1. Stop accepting new connections (server.close)
    // 2. Close the DB pool once in-flight requests are done
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Closing server...`);
      server.close(async () => {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
