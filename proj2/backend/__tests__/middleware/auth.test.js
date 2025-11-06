import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import authMiddleware from '../../middleware/auth.js';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      body: {}
    };
    res = {
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret-key';
    jest.clearAllMocks();
  });

  it('should return error if token is missing', async () => {
    await authMiddleware(req, res, next);
    
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not Authorized Login Again'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return error if token is invalid', async () => {
    req.headers.token = 'invalid-token';
    
    await authMiddleware(req, res, next);
    
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].success).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    req.headers.token = token;
    
    await authMiddleware(req, res, next);
    
    expect(req.body.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle expired tokens', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '-1h' });
    req.headers.token = token;
    
    await authMiddleware(req, res, next);
    
    expect(res.json).toHaveBeenCalled();
    expect(res.json.mock.calls[0][0].success).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });
});

