import express from "express";
import {
  getAdminOverview,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  deleteDoctor,
  getAllPatients,
  deletePatient,
  getAllAppointments,
  getAnalytics,
  migrateDoctorStatus,
  blockPatient,
  unblockPatient
} from "../controllers/adminController.js";
import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkRole.js";

const router = express.Router();

// ── Overview
router.get("/overview", verifyToken, checkRole("admin"), getAdminOverview);

// ── Doctors
router.get("/doctors",          verifyToken, checkRole("admin"), getAllDoctors);
router.put("/doctors/:id/approve", verifyToken, checkRole("admin"), approveDoctor);
router.put("/doctors/:id/reject",  verifyToken, checkRole("admin"), rejectDoctor);
router.delete("/doctors/:id",      verifyToken, checkRole("admin"), deleteDoctor);

// ── Patients
router.get("/patients",        verifyToken, checkRole("admin"), getAllPatients);
router.delete("/patients/:id", verifyToken, checkRole("admin"), deletePatient);

// ── Appointments
router.get("/appointments", verifyToken, checkRole("admin"), getAllAppointments);

// ── Analytics
router.get("/analytics", verifyToken, checkRole("admin"), getAnalytics);

router.get("/migrate-status", migrateDoctorStatus);

//block/unblock

router.put("/patients/:id/block", verifyToken, checkRole("admin"), blockPatient);
router.put("/patients/:id/unblock", verifyToken, checkRole("admin"), unblockPatient);

export default router;