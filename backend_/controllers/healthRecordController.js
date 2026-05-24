import HealthRecord from "../models/HealthRecord.js";
import Appointment from "../models/Appointment.js";


// ─────────────────────────────────────────────────────────────
// 👉 DOCTOR: Add Health Record (Vitals + File Upload)
// ─────────────────────────────────────────────────────────────
export const addHealthRecord = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can add health records" });
    }

    const doctorId = req.user.id;

    const { appointmentId, notes, status } = req.body;
    const records = req.body.records ? JSON.parse(req.body.records) : {};

    // ✅ Validate appointment
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // ✅ Security check
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ At least one vital required
    if (!records || Object.keys(records).length === 0) {
      return res.status(400).json({ message: "At least one health field is required" });
    }

    // ✅ File upload
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // ✅ Create record
    const record = await HealthRecord.create({
      patientId: appointment.patientId,
      doctorId,
      appointmentId,
      records,
      notes,
      status: status || "Normal",
      fileUrl
    });

    res.status(201).json({
      message: "Health record added successfully",
      record
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────
// 👉 PATIENT: Get My Health Records (ALL doctors)
// ─────────────────────────────────────────────────────────────
export const getMyHealthRecords = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can view health records" });
    }

    const patientId = req.user.id;

    const records = await HealthRecord.find({ patientId })
      .populate("doctorId", "name speciality")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    // ✅ Format records
    const formattedRecords = records.map((record) => ({
      _id: record._id,

      doctor: {
        name: record.doctorId?.name,
        speciality: record.doctorId?.speciality
      },

      appointment: {
        date: record.appointmentId?.date,
        time: record.appointmentId?.time
      },

      // ✅ Convert Map → Object
      records: record.records ? Object.fromEntries(record.records) : {},

      status: record.status || "Normal",
      notes: record.notes,
      fileUrl: record.fileUrl,
      createdAt: record.createdAt
    }));

    res.json(formattedRecords);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────
// 👉 DOCTOR: Update Health Record
// ─────────────────────────────────────────────────────────────
export const updateHealthRecord = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can update health records" });
    }

    const doctorId = req.user.id;
    const { recordId } = req.params;
    const { records, notes, status } = req.body;

    const record = await HealthRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // ✅ Security check
    if (record.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ Update fields
    if (records) record.records = records;
    if (notes) record.notes = notes;
    if (status) record.status = status;

    // ✅ Update file if exists
    if (req.file) {
      record.fileUrl = `/uploads/${req.file.filename}`;
    }

    await record.save();

    res.json({
      message: "Health record updated successfully",
      record
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ─────────────────────────────────────────────────────────────
// 👉 DOCTOR: Get Patient Health Records (ONLY HIS OWN)
// ─────────────────────────────────────────────────────────────
export const getPatientHealthRecords = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can view patient health records" });
    }

    const doctorId = req.user.id;
    const patientId = req.params.id;

    const records = await HealthRecord.find({ patientId, doctorId })
      .populate("doctorId", "name speciality")
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    // ✅ Convert Map → Object
    const formatted = records.map((r) => ({
      _id: r._id,
      patientId: r.patientId,
      doctorId: r.doctorId,
      appointmentId: r.appointmentId,
      records: r.records ? Object.fromEntries(r.records) : {},
      status: r.status,
      notes: r.notes,
      fileUrl: r.fileUrl,
      createdAt: r.createdAt
    }));

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};