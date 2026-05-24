import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  getDoctors,
} from "../controllers/authController.js";  // fixed

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.put("/update", verifyToken, updateProfile);
router.get("/doctors", verifyToken, getDoctors);

export default router;
