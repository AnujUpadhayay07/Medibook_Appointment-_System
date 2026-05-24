import Medicine from "../models/Medicine.js";
import Appointment from "../models/Appointment.js";

//DOCTOR: Add Medicine
export const addMedicine = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can add medicine" });
    }

    const doctorId = req.user.id;
    const { appointmentId, name, dosage, timing, duration, instructions } = req.body;

    if (!appointmentId || !name || !dosage || !timing) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    const timingArray = Array.isArray(timing) ? timing : [timing];

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Start date = appointment date
    const startDate = new Date(appointment.date);

    // End date = start + duration
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (duration || 1));

    // After defining startDate and endDate
const todayStr = new Date().toISOString().split("T")[0];

const medicine = await Medicine.create({
  patientId: appointment.patientId,
  doctorId,
  appointmentId,
  name,
  dosage,
  timing: timingArray,
  duration: duration || 1,
  instructions: instructions || "",
  startDate,
  endDate,
});

    res.status(201).json({
      message: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATIENT: Get Medicines
// Optional query param: ?today=true → for Overview section
export const getMyMedicines = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can view medicines" });
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const medicines = await Medicine.find({ patientId: req.user.id })
      .populate("doctorId", "name speciality")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    // If query param today=true → filter active medicines only
    if (req.query.today === "true") {
      const activeMedicines = medicines.filter((med) => {
        const start = new Date(med.startDate).toISOString().split("T")[0];
        const end = new Date(med.endDate).toISOString().split("T")[0];
        return todayStr >= start && todayStr <= end;
      });
      return res.json(activeMedicines);
    }

    // Else → return all medicines (past, present, future)
    res.json(medicines);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATIENT: Toggle Medicine Status
export const updateMedicineStatus = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can update medicine" });
    }

    const { id } = req.params;
    const { time } = req.body; // "Morning" or "Night"

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    if (medicine.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Find or create today's log
    let todayLog = medicine.dailyLogs.find(log => log.date === todayStr);

    if (!todayLog) {
      todayLog = {
        date: todayStr,
        doses: medicine.timing.map(t => ({ time: t, taken: false })),
      };
      medicine.dailyLogs.push(todayLog);
    }

    // Update dose status
    const dose = todayLog.doses.find(d => d.time === time);

    if (!dose) {
      return res.status(400).json({ message: "Invalid dose time" });
    }

    dose.taken = true;

    await medicine.save();

    res.json({
      message: "Dose marked as taken",
      medicine,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
