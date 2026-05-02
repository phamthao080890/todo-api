'use strict';

const { exec } = require('child_process');
const { promisify } = require('util');
const { HTTP } = require('../constants/messages');

const execPromise = promisify(exec);

/**
 * POST /api/setup/migrate
 * Runs database migrations using sequelize-cli.
 * Requires SETUP_TOKEN in Authorization header (production only).
 * One-time use endpoint for free tier deployments.
 * After migrations run, tables exist and this is safe to call multiple times.
 */
async function migrate(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validToken = process.env.SETUP_TOKEN;

  // Validate token (only required in production)
  if (process.env.NODE_ENV === 'production' && (!validToken || token !== validToken)) {
    return res.status(HTTP.FORBIDDEN).json({ message: 'Invalid or missing setup token' });
  }

  try {
    const { stdout, stderr } = await execPromise('npm run db:migrate');

    if (stderr) {
      console.warn('[setup] migration stderr:', stderr);
    }

    res.status(HTTP.OK).json({
      message: 'Migrations completed successfully',
      output: stdout,
    });
  } catch (error) {
    console.error('[setup] migration error:', error);
    res.status(HTTP.INTERNAL_ERROR).json({
      message: 'Migration failed',
      error: error.message,
    });
  }
}

module.exports = { migrate };
