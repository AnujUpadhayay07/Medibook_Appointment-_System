import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  addMedicine,
  getMyMedicines,
  updateMedicineStatus
} from "../controllers/medicineController.js";

const router = express.Router();

// Doctor adds medicine
router.post("/add", verifyToken, addMedicine);

// Patient views medicines
router.get("/my", verifyToken, getMyMedicines);

// Patient marks as taken
router.put("/status/:id", verifyToken, updateMedicineStatus);

export default router;