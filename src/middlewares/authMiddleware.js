'use strict';

const jwt = require('jsonwebtoken');
const { HTTP, MSG } = require('../constants/messages');

/**
 * Verifies the Bearer JWT in the Authorization header.
 * On success, attaches `req.user = { id, email }` and calls next().
 * On failure, responds with 401 Unauthorized.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(HTTP.UNAUTHORIZED).json({ message: MSG.AUTH_HEADER_MISSING });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach only the necessary claims — never expose the full payload
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(HTTP.UNAUTHORIZED).json({ message: MSG.AUTH_TOKEN_EXPIRED });
    }
    return res.status(HTTP.UNAUTHORIZED).json({ message: MSG.AUTH_TOKEN_INVALID });
  }
}

module.exports = authMiddleware;
