'use strict';

/**
 * Database migration helper — runs all pending migrations.
 * Used during server startup to ensure schema is up-to-date.
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

/**
 * Run database migrations using sequelize-cli
 * @param {Object} sequelize - Sequelize instance (not used but kept for API compatibility)
 * @returns {Promise<Object>} Migration result
 */
async function runMigrations(sequelize) {
  try {
    console.log('[migrations] Running pending migrations...');

    const { stdout, stderr } = await execPromise('npm run db:migrate');

    if (stderr) {
      console.warn('[migrations] stderr:', stderr);
    }

    console.log('[migrations] Migrations completed successfully');
    return { output: stdout };
  } catch (error) {
    console.error('[migrations] Migration failed:', error.message);
    throw error;
  }
}

module.exports = { runMigrations };
