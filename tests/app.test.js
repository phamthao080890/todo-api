'use strict';

// Mock routes to prevent DB connections when loading app.js.
// The auth route mock also includes an error-triggering endpoint
// to exercise the global error handler in app.js.
jest.mock('../src/routes/authRoutes', () => {
  const { Router } = require('express');
  const router = Router();
  router.get('/trigger-error', (_req, _res, next) => next(new Error('test error')));
  return router;
});

jest.mock('../src/routes/todoRoutes', () => require('express').Router());
jest.mock('../src/routes/setupRoutes', () => require('express').Router());

// Suppress console.error output from the global error handler during tests
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

const request = require('supertest');
const app = require('../app');
const { MSG } = require('../src/constants/messages');

describe('app', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 for unmatched routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: MSG.ROUTE_NOT_FOUND });
  });

  it('global error handler returns 500 for unhandled errors', async () => {
    const res = await request(app).get('/api/auth/trigger-error');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: MSG.INTERNAL_ERROR });
  });
});
