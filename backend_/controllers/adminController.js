import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

// ==========================
// 🏠 ADMIN OVERVIEW
// GET /api/admin/overview
// ==========================
export const getAdminOverview = async (req, res) => {
  try {
    const totalDoctors    = await User.countDocuments({ role: "doctor" });

    // ✅ UPDATED TO STATUS
    const approvedDoctors = await User.countDocuments({ role: "doctor", status: "approved" });
    const pendingDoctors  = await User.countDocuments({ role: "doctor", status: "pending" });

    const totalPatients   = await User.countDocuments({ role: "patient" });

    // ✅ DATE HANDLING
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // ✅ Counts
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalAppointments = await Appointment.countDocuments();

    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const pendingAppointments   = await Appointment.countDocuments({ status: "pending" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });

    // ✅ Today appointments list
    const todayAppointmentsList = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("patientId", "name")
      .populate("doctorId", "name speciality")
      .sort({ time: 1 });

    // ✅ Recent appointments
    const recentAppointments = await Appointment.find()
      .populate("patientId", "name")
      .populate("doctorId", "name speciality")
      .sort({ createdAt: -1 })
      .limit(5);

    // ✅ UPDATED: Pending approvals
    const pendingApprovals = await User.find({ role: "doctor", status: "pending" })
      .select("name email speciality experience fees createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        totalPatients,
        todayAppointments,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        cancelledAppointments,
      },
      todayAppointmentsList,
      recentAppointments,
      pendingApprovals,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 🩺 GET ALL DOCTORS
// GET /api/admin/doctors
// ==========================
export const getAllDoctors = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = { role: "doctor" };

    // ✅ UPDATED FILTER
    if (status && status !== "all") {
      filter.status = status;
    }

    const doctors = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    // ✅ Attach appointment count
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doc) => {
        const appointmentCount = await Appointment.countDocuments({ doctorId: doc._id });
        return { ...doc.toObject(), appointmentCount };
      })
    );

    res.json(doctorsWithStats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// ✅ APPROVE DOCTOR
// ==========================
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved", isApproved: true }, // ✅ BOTH UPDATED
      { new: true }
    ).select("-password");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Doctor approved successfully", doctor });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// ❌ REJECT DOCTOR
// ==========================
export const rejectDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", isApproved: false }, // ✅ UPDATED
      { new: true }
    ).select("-password");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Doctor rejected", doctor });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 🗑️ DELETE DOCTOR
// ==========================
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndDelete({ _id: req.params.id, role: "doctor" });

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await Appointment.deleteMany({ doctorId: req.params.id });

    res.json({ message: "Doctor deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 👥 GET ALL PATIENTS
// ==========================
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("-password")
      .sort({ createdAt: -1 });

    const patientsWithStats = await Promise.all(
      patients.map(async (p) => {
        const appointmentCount = await Appointment.countDocuments({ patientId: p._id });
        return { ...p.toObject(), appointmentCount };
      })
    );

    res.json(patientsWithStats);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 🗑️ DELETE PATIENT
// ==========================
export const deletePatient = async (req, res) => {
  try {
    const patient = await User.findOneAndDelete({ _id: req.params.id, role: "patient" });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    await Appointment.deleteMany({ patientId: req.params.id });

    res.json({ message: "Patient deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 📋 GET ALL APPOINTMENTS
// ==========================
export const getAllAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (date) filter.date = date;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
      .populate("doctorId",  "name speciality")
      .sort({ date: -1 });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 📊 ANALYTICS
// ==========================
export const getAnalytics = async (req, res) => {
  try {
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const start = new Date(d.setHours(0, 0, 0, 0));
      const end   = new Date(d.setHours(23, 59, 59, 999));

      const count = await Appointment.countDocuments({
        date: { $gte: start, $lte: end },
      });

      last7Days.push({
        date: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count,
      });
    }

    const byStatus = {
      pending:   await Appointment.countDocuments({ status: "pending" }),
      confirmed: await Appointment.countDocuments({ status: "confirmed" }),
      completed: await Appointment.countDocuments({ status: "completed" }),
      cancelled: await Appointment.countDocuments({ status: "cancelled" }),
    };

    // ✅ UPDATED
    const specialityAgg = await User.aggregate([
      { $match: { role: "doctor", status: "approved" } },
      { $group: { _id: "$speciality", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);

      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const count = await User.countDocuments({
        role: "patient",
        createdAt: { $gte: start, $lte: end },
      });

      last6Months.push({
        month: start.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        count,
      });
    }

    res.json({ last7Days, byStatus, specialityAgg, last6Months });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// 🔄 MIGRATION (RUN ONCE)
// ==========================
export const migrateDoctorStatus = async (req, res) => {
  try {
    await User.updateMany(
      { role: "doctor", isApproved: true },
      { $set: { status: "approved" } }
    );

    await User.updateMany(
      { role: "doctor", isApproved: false },
      { $set: { status: "pending" } }
    );

    res.json({ message: "Migration successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ==========================
// 🚫 BLOCK PATIENT
// PUT /api/admin/patients/:id/block
// ==========================
export const blockPatient = async (req, res) => {
  try {
    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: "patient" },
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient blocked", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// ✅ UNBLOCK PATIENT
// PUT /api/admin/patients/:id/unblock
// ==========================
export const unblockPatient = async (req, res) => {
  try {
    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: "patient" },
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient unblocked", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};