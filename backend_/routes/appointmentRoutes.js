import express from "express";
import verifyToken from "../middleware/verifyToken.js";

import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getMyDoctors,
  updateAppointmentStatus,
  markAsCompleted,
  getAvailableSlots,
} from "../controllers/appointmentController.js";

const router = express.Router();

// PATIENT ROUTES
// Book appointment
router.post("/", verifyToken, bookAppointment);

// Get my appointments
router.get("/my", verifyToken, getMyAppointments);

// Cancel appointment
router.put("/cancel/:id", verifyToken, cancelAppointment);

// Get my doctors
router.get("/doctors", verifyToken, getMyDoctors);

// NEW → Get available slots for booking
// Example: /api/appointments/slots?doctorId=123&date=2026-04-10
router.get("/slots", verifyToken, getAvailableSlots);

// DOCTOR ROUTES
// Accept / Reject appointment
router.put("/:id/status", verifyToken, updateAppointmentStatus);

// Mark appointment as completed
router.put("/:id/complete", verifyToken, markAsCompleted);

export default router;
