'use strict';

/**
 * Unit tests for src/middlewares/authMiddleware.js
 *
 * Strategy: stub `jsonwebtoken` so no real signing/keys are needed.
 * The middleware under test is exercised in complete isolation.
 */

const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middlewares/authMiddleware');
const { MSG } = require('../src/constants/messages');

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildMocks(authHeader) {
  const req = { headers: { authorization: authHeader } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('authMiddleware', () => {
  const FAKE_SECRET = 'test-secret';
  const VALID_PAYLOAD = { id: 1, email: 'alice@example.com' };

  beforeAll(() => {
    process.env.JWT_SECRET = FAKE_SECRET;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── Missing / malformed header ───────────────────────────────────────────

  it('returns 401 when Authorization header is absent', () => {
    const { req, res, next } = buildMocks(undefined);
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining(MSG.AUTH_HEADER_MISSING) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header does not start with "Bearer "', () => {
    const { req, res, next } = buildMocks('Basic sometoken');
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // ── Invalid / tampered token ─────────────────────────────────────────────

  it('returns 401 when the token signature is invalid', () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      const err = new Error('invalid signature');
      err.name = 'JsonWebTokenError';
      throw err;
    });

    const { req, res, next } = buildMocks('Bearer tampered.token.here');
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: MSG.AUTH_TOKEN_INVALID }));
    expect(next).not.toHaveBeenCalled();
  });

  // ── Expired token ────────────────────────────────────────────────────────

  it('returns 401 with "Token has expired" message when token is expired', () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      throw err;
    });

    const { req, res, next } = buildMocks('Bearer expired.token.here');
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: MSG.AUTH_TOKEN_EXPIRED })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // ── Valid token ──────────────────────────────────────────────────────────

  it('calls next() and attaches req.user when token is valid', () => {
    jest.spyOn(jwt, 'verify').mockReturnValue(VALID_PAYLOAD);

    const { req, res, next } = buildMocks('Bearer valid.token.here');
    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: VALID_PAYLOAD.id, email: VALID_PAYLOAD.email });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('does not expose extra JWT claims beyond id and email on req.user', () => {
    const richPayload = { ...VALID_PAYLOAD, role: 'admin', iat: 1000, exp: 9999 };
    jest.spyOn(jwt, 'verify').mockReturnValue(richPayload);

    const { req, res, next } = buildMocks('Bearer valid.token.here');
    authMiddleware(req, res, next);

    expect(req.user).toStrictEqual({ id: VALID_PAYLOAD.id, email: VALID_PAYLOAD.email });
    expect(next).toHaveBeenCalled();
  });
});
