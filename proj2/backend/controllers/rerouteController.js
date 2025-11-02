import rerouteModel from "../models/rerouteModel.js";

export const listReroutes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
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
