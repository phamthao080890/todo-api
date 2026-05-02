'use strict';

const express = require('express');
const request = require('supertest');
const { HTTP } = require('../src/constants/messages');
const {
  registerRules,
  loginRules,
  createTodoRules,
  updateTodoRules,
} = require('../src/middlewares/validationMiddleware');

/**
 * Creates a minimal Express app that applies the given middleware rules
 * to POST /test and returns 200 if validation passes.
 */
function makeApp(rules) {
  const app = express();
  app.use(express.json());
  app.post('/test', rules, (_req, res) => res.status(HTTP.OK).json({ ok: true }));
  return app;
}

describe('validationMiddleware', () => {
  // ── registerRules ─────────────────────────────────────────────────────────

  describe('registerRules', () => {
    const app = makeApp(registerRules);

    it('passes with all valid fields', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: 'Password1',
        displayName: 'Alice',
      });
      expect(res.status).toBe(200);
    });

    it('returns 422 for invalid email', async () => {
      const res = await request(app).post('/test').send({
        email: 'not-an-email',
        password: 'Password1',
        displayName: 'Alice',
      });
      expect(res.status).toBe(422);
      expect(res.body.errors).toBeInstanceOf(Array);
    });

    it('returns 422 when password is shorter than 8 characters', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: 'Ab1',
        displayName: 'Alice',
      });
      expect(res.status).toBe(422);
    });

    it('returns 422 when password has no uppercase letter', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: 'password1',
        displayName: 'Alice',
      });
      expect(res.status).toBe(422);
    });

    it('returns 422 when password has no digit', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: 'Password',
        displayName: 'Alice',
      });
      expect(res.status).toBe(422);
    });

    it('returns 422 when displayName is empty', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: 'Password1',
        displayName: '   ',
      });
      expect(res.status).toBe(422);
    });

    it('returns 422 when displayName exceeds 100 characters', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: 'Password1',
        displayName: 'A'.repeat(101),
      });
      expect(res.status).toBe(422);
    });
  });

  // ── loginRules ────────────────────────────────────────────────────────────

  describe('loginRules', () => {
    const app = makeApp(loginRules);

    it('passes with valid credentials', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: 'anything',
      });
      expect(res.status).toBe(200);
    });

    it('returns 422 for invalid email', async () => {
      const res = await request(app).post('/test').send({
        email: 'not-an-email',
        password: 'anything',
      });
      expect(res.status).toBe(422);
    });

    it('returns 422 when password is empty', async () => {
      const res = await request(app).post('/test').send({
        email: 'alice@example.com',
        password: '',
      });
      expect(res.status).toBe(422);
    });
  });

  // ── createTodoRules ───────────────────────────────────────────────────────

  describe('createTodoRules', () => {
    const app = makeApp(createTodoRules);

    it('passes with title and description', async () => {
      const res = await request(app).post('/test').send({ title: 'My todo', description: 'details' });
      expect(res.status).toBe(200);
    });

    it('passes without optional description', async () => {
      const res = await request(app).post('/test').send({ title: 'My todo' });
      expect(res.status).toBe(200);
    });

    it('returns 422 when title is missing', async () => {
      const res = await request(app).post('/test').send({ description: 'no title' });
      expect(res.status).toBe(422);
    });

    it('returns 422 when title is blank (whitespace only)', async () => {
      const res = await request(app).post('/test').send({ title: '   ' });
      expect(res.status).toBe(422);
    });

    it('returns 422 when title exceeds 255 characters', async () => {
      const res = await request(app).post('/test').send({ title: 'A'.repeat(256) });
      expect(res.status).toBe(422);
    });

    it('returns 422 when description is not a string', async () => {
      const res = await request(app).post('/test').send({ title: 'My todo', description: 123 });
      expect(res.status).toBe(422);
    });
  });

  // ── updateTodoRules ───────────────────────────────────────────────────────

  describe('updateTodoRules', () => {
    const app = makeApp(updateTodoRules);

    it('passes with all valid optional fields', async () => {
      const res = await request(app).post('/test').send({
        title: 'Updated title',
        description: 'Updated desc',
        completed: true,
      });
      expect(res.status).toBe(200);
    });

    it('passes with an empty body (all fields are optional)', async () => {
      const res = await request(app).post('/test').send({});
      expect(res.status).toBe(200);
    });

    it('returns 422 when title is present but empty', async () => {
      const res = await request(app).post('/test').send({ title: '' });
      expect(res.status).toBe(422);
    });

    it('returns 422 when title exceeds 255 characters', async () => {
      const res = await request(app).post('/test').send({ title: 'A'.repeat(256) });
      expect(res.status).toBe(422);
    });

    it('returns 422 when completed is not a boolean', async () => {
      const res = await request(app).post('/test').send({ completed: 'yes' });
      expect(res.status).toBe(422);
    });

    it('returns 422 when description is not a string', async () => {
      const res = await request(app).post('/test').send({ title: 'ok', description: 42 });
      expect(res.status).toBe(422);
    });
  });
});
