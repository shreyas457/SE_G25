import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import shelterModel from '../../models/shelterModel.js';
import { seedShelters, listShelters } from '../../controllers/shelterController.js';

describe('Shelter Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('seedShelters', () => {
    it('should seed shelters if collection is empty', async () => {
      shelterModel.estimatedDocumentCount = jest.fn().mockResolvedValue(0);
      shelterModel.insertMany = jest.fn().mockResolvedValue([]);

      await seedShelters(req, res);

      expect(shelterModel.estimatedDocumentCount).toHaveBeenCalled();
      expect(shelterModel.insertMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].count).toBeDefined();
    });

    it('should not seed if shelters already exist', async () => {
      shelterModel.estimatedDocumentCount = jest.fn().mockResolvedValue(5);

      await seedShelters(req, res);

      expect(shelterModel.estimatedDocumentCount).toHaveBeenCalled();
      expect(shelterModel.insertMany).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Shelters already exist'
      });
    });

    it('should handle errors when seeding', async () => {
      shelterModel.estimatedDocumentCount = jest.fn().mockResolvedValue(0);
      shelterModel.insertMany = jest.fn().mockRejectedValue(new Error('Database error'));

      await seedShelters(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error seeding shelters'
      });
    });
  });

  describe('listShelters', () => {
    it('should list active shelters', async () => {
      const mockShelters = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Shelter 1',
          active: true
        },
        {
          _id: '507f1f77bcf86cd799439012',
          name: 'Shelter 2',
          active: true
        }
      ];

      shelterModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockShelters)
      });

      await listShelters(req, res);

      expect(shelterModel.find).toHaveBeenCalledWith({ active: true });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockShelters
      });
    });

    it('should handle errors when listing shelters', async () => {
      shelterModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await listShelters(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching shelters'
      });
    });
  });
});

