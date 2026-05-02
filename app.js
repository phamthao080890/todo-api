'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./src/routes/authRoutes');
const todoRoutes = require('./src/routes/todoRoutes');
const setupRoutes = require('./src/routes/setupRoutes');
const { HTTP, MSG } = require('./src/constants/messages');

const app = express();

// ── Trust reverse proxy (nginx, AWS ALB, etc.) ───────────────────────────────
app.set('trust proxy', 1);

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── HTTP request logging ──────────────────────────────────────────────────────
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Rate limiting on auth endpoints ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: MSG.TOO_MANY_REQUESTS },
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.status(HTTP.OK).json({ status: 'ok' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/setup', setupRoutes);  // one-time migration setup (free tier)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/todos', todoRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(HTTP.NOT_FOUND).json({ message: MSG.ROUTE_NOT_FOUND }));

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[unhandled error]', err);
  res.status(HTTP.INTERNAL_ERROR).json({ message: MSG.INTERNAL_ERROR });
});

module.exports = app;
