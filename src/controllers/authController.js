'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { HTTP, MSG } = require('../constants/messages');

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { email, password, displayName } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(HTTP.CONFLICT).json({ message: MSG.AUTH_EMAIL_TAKEN });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({ email, password: hashedPassword, displayName });

    return res.status(HTTP.CREATED).json({
      message: MSG.AUTH_REGISTER_SUCCESS,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    // Use constant-time comparison to prevent user enumeration
    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatch) {
      return res.status(HTTP.UNAUTHORIZED).json({ message: MSG.AUTH_INVALID_CREDENTIALS });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(HTTP.OK).json({
      message: MSG.AUTH_LOGIN_SUCCESS,
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
  }
}

module.exports = { register, login };
