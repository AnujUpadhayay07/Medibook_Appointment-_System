import Appointment from "../models/Appointment.js";
import Medicine from "../models/Medicine.js";
import User from "../models/User.js";
console.log("Imported Medicine:", Medicine);
export const getDashboard = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Total visits
    const totalVisits = await Appointment.countDocuments({ patientId });

    // Upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientId,
      date: { $gte: new Date() }
    }).populate("doctorId", "name");

    // Active medicines
    const activeMeds = await Medicine.countDocuments({
      patientId,
      status: "pending"
    });

    // Doctors linked (distinct)
    const doctors = await Appointment.distinct("doctorId", { patientId });

    res.json({
      totalVisits,
      upcoming: upcomingAppointments.length,
      activeMeds,
      doctors: doctors.length,
      appointments: upcomingAppointments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};