import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import HealthRecord from "../models/HealthRecord.js";
import bcrypt from "bcryptjs";

// DOCTOR DASHBOARD OVERVIEW
export const getDoctorDashboardOverview = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await User.findById(doctorId).select("name speciality");

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay   = new Date(today.setHours(23, 59, 59, 999));

    const allAppointments   = await Appointment.find({ doctorId });
    const todayAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("patientId", "name");

    const totalPatients   = await Appointment.distinct("patientId", { doctorId });
    const completedToday  = todayAppointments.filter(a => a.status === "completed").length;
    const pendingToday    = todayAppointments.filter(a => a.status !== "completed").length;
    const requests        = todayAppointments.filter(a => a.status === "pending");

    const todayQueue = todayAppointments
      .filter(a => a.status === "confirmed" || a.status === "completed")
      .map(a => ({
        id:          a._id,
        patientName: a.patientId?.name || "Unknown",
        time:        a.time,
        status:      a.status,
        note:        a.note,
      }));

    const appointmentRequests = requests.map(a => ({
      id:          a._id,
      patientName: a.patientId?.name || "Unknown",
      date:        a.date,
      time:        a.time,
      note:        a.note,
    }));

    res.json({
      doctor,
      stats: {
        todayAppointments: todayAppointments.length,
        completedToday,
        pendingToday,
        totalPatients:      totalPatients.length,
        totalAppointments:  allAppointments.length,
      },
      todayQueue,
      appointmentRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL APPOINTMENTS
export const getMyAppointmentsForDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name age gender email")
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET UPCOMING APPOINTMENTS
export const getUpcomingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const now = new Date();
    const upcoming = await Appointment.find({
      doctorId,
      date:   { $gte: now },
      status: { $ne: "cancelled" },
    }).populate("patientId", "name age gender email");
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PATIENTS
export const getMyPatients = async (req, res) => {
  try {
    const doctorId  = req.user.id;
    const patientIds = await Appointment.distinct("patientId", { doctorId });
    const patients   = await User.find({ _id: { $in: patientIds } }).select(
      "name email age gender"
    );
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PATIENT HEALTH RECORDS
export const getPatientHealthRecords = async (req, res) => {
  try {
    const patientId = req.params.id;
    const records = await HealthRecord.find({ patientId })
      .populate("doctorId",      "name speciality")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET DOCTOR PROFILE
// GET /api/doctor/profile
export const getDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await User.findById(doctorId).select(
      "-password"
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE DOCTOR PROFILE
// PUT /api/doctor/profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const {
      name, phone, dob, gender,
      city, state, country, pincode,
      speciality, experience, fees,
      currentPassword, newPassword,
    } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // ── Basic fields ───────────────────────────────────────────────
    if (name)       doctor.name       = name;
    if (phone)      doctor.phone      = phone;
    if (dob)        doctor.dob        = new Date(dob);
    if (gender)     doctor.gender     = gender;
    if (city)       doctor.city       = city;
    if (state)      doctor.state      = state;
    if (country)    doctor.country    = country;
    if (pincode)    doctor.pincode    = pincode;
    if (speciality) doctor.speciality = speciality;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (fees !== undefined)       doctor.fees       = Number(fees);

    // ── Password change (optional) ────────────────────────────────────────
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      doctor.password = await bcrypt.hash(newPassword, 10);
    }

    await doctor.save();

    // Return doctor without password
    const updated = await User.findById(doctorId).select("-password");
    res.json({ message: "Profile updated successfully", doctor: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET DOCTOR APPOINTMENTS (with optional status/date filters)
// GET /api/doctor/appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;  // currently logged-in doctor
    const { status, date } = req.query;

    const filter = { doctorId };
    if (status && status !== "all") filter.status = status;
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email age gender") // populate patient info
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
