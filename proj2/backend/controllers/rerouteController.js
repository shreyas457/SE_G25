import rerouteModel from "../models/rerouteModel.js";

/**
 * Retrieves paginated list of reroute records (orders redirected to shelters)
 * Supports pagination with configurable page and limit parameters
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.page="1"] - Page number (minimum 1)
 * @param {string} [req.query.limit="20"] - Items per page (1-100, default 20)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status, data array, pagination info, and total count
 */
export const listReroutes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100
    );
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      rerouteModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      rerouteModel.countDocuments({}),
    ]);

    res.json({ success: true, data: rows, page, limit, total });
  } catch (e) {
    console.error(e);
    res.json({ success: false, message: "Error fetching reroutes" });
  }
};
