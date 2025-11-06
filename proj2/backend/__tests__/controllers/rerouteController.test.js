import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import rerouteModel from '../../models/rerouteModel.js';
import { listReroutes } from '../../controllers/rerouteController.js';

describe('Reroute Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('listReroutes', () => {
    it('should list reroutes with default pagination', async () => {
      const mockReroutes = [
        { _id: '1', orderId: 'order1', shelterId: 'shelter1' },
        { _id: '2', orderId: 'order2', shelterId: 'shelter2' },
      ];

      rerouteModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockReroutes)
          })
        })
      });
      rerouteModel.countDocuments = jest.fn().mockResolvedValue(2);

      await listReroutes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReroutes,
        page: 1,
        limit: 20,
        total: 2
      });
    });

    it('should handle custom pagination parameters', async () => {
      req.query = { page: '2', limit: '10' };
      const mockReroutes = [{ _id: '1' }];

      rerouteModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockReroutes)
          })
        })
      });
      rerouteModel.countDocuments = jest.fn().mockResolvedValue(15);

      await listReroutes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockReroutes,
        page: 2,
        limit: 10,
        total: 15
      });
    });

    it('should enforce minimum page value', async () => {
      req.query = { page: '0', limit: '5' };
      const mockReroutes = [];

      rerouteModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockReroutes)
          })
        })
      });
      rerouteModel.countDocuments = jest.fn().mockResolvedValue(0);

      await listReroutes(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });

    it('should enforce maximum limit value', async () => {
      req.query = { page: '1', limit: '200' };
      const mockReroutes = [];

      rerouteModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockReroutes)
          })
        })
      });
      rerouteModel.countDocuments = jest.fn().mockResolvedValue(0);

      await listReroutes(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it('should handle errors', async () => {
      rerouteModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });

      await listReroutes(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching reroutes'
      });
    });
  });
});

