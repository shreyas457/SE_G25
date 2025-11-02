// routes/rerouteRoutes.js
import express from "express";
import authMiddleware from "../middleware/auth.js";
import { listReroutes } from "../controllers/rerouteController.js";

const rerouteRouter = express.Router();

// GET /api/reroutes?page=&limit=&shelterId=&orderId=
// auth is optional—enable if your app requires login to view history
rerouteRouter.get("/", /* authMiddleware, */ listReroutes);

export default rerouteRouter;
