import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkRole.js";
import { getDashboard, getProfile } from "../controllers/patientController.js";
import { getMyMedicines, updateMedicineStatus } from "../controllers/medicineController.js";

const router = express.Router();

// Patient Profile & Dashboard
router.get("/profile", verifyToken, getProfile);
router.get("/dashboard", verifyToken, getDashboard);

// ✅ Get all medicines (optional ?today=true)
router.get("/medicines", verifyToken, checkRole("patient"), getMyMedicines);

// ✅ Mark dose as taken
router.put("/medicines/:id/take", verifyToken, checkRole("patient"), updateMedicineStatus);

export default router;