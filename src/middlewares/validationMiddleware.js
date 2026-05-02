'use strict';

const { body, validationResult } = require('express-validator');
const { HTTP } = require('../constants/messages');

/**
 * Shared handler — returns 422 if any prior validation rules failed.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP.UNPROCESSABLE).json({ errors: errors.array() });
  }
  next();
}

const registerRules = [
  body('email')
    .trim()
    .isEmail().withMessage('A valid email address is required.')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one digit.'),

  body('displayName')
    .trim()
    .notEmpty().withMessage('Display name is required.')
    .isLength({ max: 100 }).withMessage('Display name must not exceed 100 characters.'),

  handleValidationErrors,
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email address is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];

const createTodoRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters.'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string.'),
  handleValidationErrors,
];

const updateTodoRules = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title must not be empty.')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters.'),
  body('description')
    .optional()
    .isString().withMessage('Description must be a string.'),
  body('completed')
    .optional()
    .isBoolean().withMessage('completed must be a boolean.'),
  handleValidationErrors,
];

module.exports = { registerRules, loginRules, createTodoRules, updateTodoRules };
