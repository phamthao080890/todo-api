'use strict';

/**
 * HTTP status codes used across the application.
 */
const HTTP = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
};

/**
 * Centralised error and success messages.
 * Import these instead of hardcoding strings in controllers / middlewares.
 */
const MSG = {
  // Auth
  AUTH_HEADER_MISSING: 'Authorization header missing or malformed.',
  AUTH_TOKEN_EXPIRED: 'Token has expired.',
  AUTH_TOKEN_INVALID: 'Invalid token.',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password.',
  AUTH_EMAIL_TAKEN: 'Email is already registered.',
  AUTH_REGISTER_SUCCESS: 'User registered successfully.',
  AUTH_LOGIN_SUCCESS: 'Login successful.',

  // Todos
  TODO_NOT_FOUND: 'Todo not found.',

  // Generic
  INTERNAL_ERROR: 'Internal server error.',
  ROUTE_NOT_FOUND: 'Route not found.',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later.',
};

module.exports = { HTTP, MSG };
