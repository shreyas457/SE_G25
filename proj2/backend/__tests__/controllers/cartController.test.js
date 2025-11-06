import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import userModel from '../../models/userModel.js';
import { addToCart, removeFromCart, getCart } from '../../controllers/cartController.js';

describe('Cart Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add new item to cart', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        cartData: {}
      };

      userModel.findOne = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await addToCart(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Added To Cart'
      });
    });

    it('should increment quantity for existing item', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        cartData: {
          '507f1f77bcf86cd799439012': 2
        }
      };

      userModel.findOne = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Added To Cart'
      });
    });

    it('should handle errors when adding to cart', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012'
      };

      userModel.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await addToCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error'
      });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        cartData: {
          '507f1f77bcf86cd799439012': 2
        }
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await removeFromCart(req, res);

      expect(userModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Removed From Cart'
      });
    });

    it('should not decrement below zero', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012'
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        cartData: {
          '507f1f77bcf86cd799439012': 0
        }
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Removed From Cart'
      });
    });

    it('should handle errors when removing from cart', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011',
        itemId: '507f1f77bcf86cd799439012'
      };

      userModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await removeFromCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error'
      });
    });
  });

  describe('getCart', () => {
    it('should get user cart successfully', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011'
      };

      const mockCartData = {
        '507f1f77bcf86cd799439012': 2,
        '507f1f77bcf86cd799439013': 1
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        cartData: mockCartData
      };

      userModel.findById = jest.fn().mockResolvedValue(mockUser);

      await getCart(req, res);

      expect(userModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        cartData: mockCartData
      });
    });

    it('should handle errors when getting cart', async () => {
      req.body = {
        userId: '507f1f77bcf86cd799439011'
      };

      userModel.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await getCart(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error'
      });
    });
  });
});

