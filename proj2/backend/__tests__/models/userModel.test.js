import { describe, it, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import userModel from '../../models/userModel.js';

describe('User Model', () => {
  it('should create a user with required fields', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123'
    };

    const user = new userModel(userData);

    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('hashedPassword123');
    expect(user.cartData).toEqual({});
  });

  it('should create a user with address', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123',
      address: {
        formatted: '123 Main St, City, State',
        lat: 35.7796,
        lng: -78.6382
      }
    };

    const user = new userModel(userData);

    expect(user.address.formatted).toBe('123 Main St, City, State');
    expect(user.address.lat).toBe(35.7796);
    expect(user.address.lng).toBe(-78.6382);
  });

  it('should have default empty cartData', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword123'
    };

    const user = new userModel(userData);

    expect(user.cartData).toEqual({});
  });

  it('should require name field', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'hashedPassword123'
    };

    const user = new userModel(userData);
    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('should require email field', async () => {
    const userData = {
      name: 'Test User',
      password: 'hashedPassword123'
    };

    const user = new userModel(userData);
    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('should require password field', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    };

    const user = new userModel(userData);
    const error = user.validateSync();

    expect(error).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });
});



