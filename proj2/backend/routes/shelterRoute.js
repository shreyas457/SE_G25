import express from "express";
import { seedShelters, listShelters } from "../controllers/shelterController.js";

const shelterRouter = express.Router();

// One-time seeding (safe to call repeatedly; no duplicates)
shelterRouter.post("/seed", seedShelters);

// List active shelters
shelterRouter.get("/list", listShelters);

export default shelterRouter;
