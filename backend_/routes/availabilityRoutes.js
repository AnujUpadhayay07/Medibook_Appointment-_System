import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkRole.js";
import { getAvailability, saveAvailability, getAvailabilityForDoctor } from "../controllers/availabilityController.js";

const router = express.Router();

// GET  /api/doctor/availability
router.get("/", verifyToken, checkRole("doctor"), getAvailability);

// PUT  /api/doctor/availability
router.put("/", verifyToken, checkRole("doctor"), saveAvailability);

// routes/availabilityRoutes.js

// GET /api/doctor/availability/:doctorId  → for patients
router.get("/:doctorId", verifyToken, getAvailabilityForDoctor);

export default router;
