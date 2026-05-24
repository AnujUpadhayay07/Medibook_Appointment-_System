import express from "express";
import {
  getDoctorDashboardOverview,
  getDoctorAppointments,
  getUpcomingAppointments,
  getMyPatients,
  getDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import {
  addHealthRecord,
  updateHealthRecord,
  getPatientHealthRecords,
} from "../controllers/healthRecordController.js";
import {
  updateAppointmentStatus,
  markAsCompleted,
} from "../controllers/appointmentController.js";
import { addMedicine } from "../controllers/medicineController.js";
import upload from "../middleware/uploadMiddleware.js";
import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkrole.js";

const router = express.Router();

// ── Dashboard
router.get("/dashboard", verifyToken, checkRole("doctor"), getDoctorDashboardOverview);

// ── Appointments
router.get("/appointments", verifyToken, checkRole("doctor"), getDoctorAppointments); // main endpoint
router.get("/appointments/upcoming", verifyToken, checkRole("doctor"), getUpcomingAppointments);
router.put("/appointments/:id/status", verifyToken, checkRole("doctor"), updateAppointmentStatus);
router.put("/appointments/:id/complete", verifyToken, checkRole("doctor"), markAsCompleted);

// ── Patients
router.get("/patients", verifyToken, checkRole("doctor"), getMyPatients);
router.get("/patients/:id/health-records", verifyToken, checkRole("doctor"), getPatientHealthRecords);

// ── Health Records
router.post("/patients/:id/health-record", verifyToken, checkRole("doctor"), upload.single("file"), addHealthRecord);
router.put("/patients/:patientId/health-record/:recordId", verifyToken, checkRole("doctor"), upload.single("file"), updateHealthRecord);

// ── Profile
router.get("/profile", verifyToken, checkRole("doctor"), getDoctorProfile);
router.put("/profile", verifyToken, checkRole("doctor"), updateDoctorProfile);

// ── Medicine
router.post("/medicine", verifyToken, checkRole("doctor"), addMedicine);

export default router;