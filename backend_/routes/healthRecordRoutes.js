import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  getMyHealthRecords,
  addHealthRecord,
  updateHealthRecord
} from "../controllers/healthRecordController.js";

const router = express.Router();

// Patient view
router.get("/my", verifyToken, getMyHealthRecords);

// Doctor add
router.post("/add", verifyToken, upload.single("file"), addHealthRecord);

//update health records
router.put("/update/:recordId", verifyToken, updateHealthRecord);

// Doctor adds a health record (single file upload)
router.post(
  "/add",
  verifyToken,
  upload.single("file"), // 👈 expects field name "file"
  addHealthRecord
);

// Doctor updates a health record (optional file)
router.put(
  "/update/:recordId",
  verifyToken,
  upload.single("file"), // 👈 optional new file
  updateHealthRecord
);


export default router;