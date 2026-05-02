'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock models before importing the controller
jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { User } = require('../src/models');
const { register, login } = require('../src/controllers/authController');
const { MSG } = require('../src/constants/messages');

// Suppress console.error noise in test output
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

function buildRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('authController', () => {
  afterEach(() => jest.clearAllMocks());

  // ── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('returns 201 and user on success', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: 1, email: 'a@b.com', displayName: 'Alice' });

      const req = { body: { email: 'a@b.com', password: 'Password1', displayName: 'Alice' } };
      const res = buildRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: MSG.AUTH_REGISTER_SUCCESS,
          user: expect.objectContaining({ id: 1, email: 'a@b.com', displayName: 'Alice' }),
        })
      );
    });

    it('returns 409 when email is already registered', async () => {
      User.findOne.mockResolvedValue({ id: 1 });

      const req = { body: { email: 'a@b.com', password: 'Password1', displayName: 'Alice' } };
      const res = buildRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: MSG.AUTH_EMAIL_TAKEN });
    });

    it('returns 500 on unexpected DB error', async () => {
      User.findOne.mockRejectedValue(new Error('DB down'));

      const req = { body: { email: 'a@b.com', password: 'Password1', displayName: 'Alice' } };
      const res = buildRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: MSG.INTERNAL_ERROR });
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const mockUser = { id: 1, email: 'a@b.com', displayName: 'Alice', password: 'hashed' };

    it('returns 200 with token when credentials are valid', async () => {
      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock.jwt.token');
      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_EXPIRES_IN = '1h';

      const req = { body: { email: 'a@b.com', password: 'Password1' } };
      const res = buildRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'mock.jwt.token',
          user: expect.objectContaining({ id: 1, email: 'a@b.com' }),
        })
      );
    });

    it('uses default expiry of 1h when JWT_EXPIRES_IN is not set', async () => {
      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('tok');
      delete process.env.JWT_EXPIRES_IN;

      const req = { body: { email: 'a@b.com', password: 'Password1' } };
      const res = buildRes();

      await login(req, res);

      expect(signSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ expiresIn: '1h' })
      );
    });

    it('returns 401 when user is not found', async () => {
      User.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const req = { body: { email: 'a@b.com', password: 'wrong' } };
      const res = buildRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: MSG.AUTH_INVALID_CREDENTIALS });
    });

    it('returns 401 when password does not match', async () => {
      User.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const req = { body: { email: 'a@b.com', password: 'wrong' } };
      const res = buildRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 500 on unexpected DB error', async () => {
      User.findOne.mockRejectedValue(new Error('DB down'));

      const req = { body: { email: 'a@b.com', password: 'Password1' } };
      const res = buildRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: MSG.INTERNAL_ERROR });
    });
  });
});
