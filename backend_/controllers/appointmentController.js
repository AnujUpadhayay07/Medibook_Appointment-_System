import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Availability from "../models/Availability.js";
import { generateSlots } from "../utils/slotGenerator.js";


// BOOK APPOINTMENT (PATIENT)

export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, date, time, note } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "doctorId, date and time are required" });
    }

    // Prevent past date booking
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return res.status(400).json({ message: "Cannot book an appointment in the past" });
    }

    // Get day name from date (safe: no timezone issue)
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayName = localDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Fetch doctor availability
    const doctorAvailability = await Availability.findOne({ doctorId });

    if (!doctorAvailability) {
      return res.status(400).json({ message: "Doctor schedule not set" });
    }

    const daySchedule = doctorAvailability.availability?.[
      // Match key case-insensitively (Monday vs monday)
      Object.keys(doctorAvailability.availability).find(
        (k) => k.toLowerCase() === dayName
      )
    ];

    if (!daySchedule?.enabled) {
      return res.status(400).json({ message: "Doctor is not available on this day" });
    }

    // Generate valid slots
    const slots = generateSlots(
      daySchedule.slots,
      doctorAvailability.consultationDuration,
      doctorAvailability.breakTime
    );

    if (!slots.includes(time)) {
      return res.status(400).json({ message: "Invalid time slot selected" });
    }

    // Max patients per day check
    const count = await Appointment.countDocuments({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    });

    if (count >= (doctorAvailability.maxPatientsPerDay || 20)) {
      return res.status(400).json({ message: "Doctor is fully booked for this day" });
    }

    // Create appointment
    // If two patients hit at the same ms, MongoDB unique index will throw 11000
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      note: note || "",
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {
    // RACE CONDITION HANDLER — MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This slot was just booked by someone else. Please choose another time.",
      });
    }
    res.status(500).json({ message: error.message });
  }
};


// GET AVAILABLE SLOTS

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: "doctorId and date are required" });
    }

    // Timezone-safe day name
    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayName = localDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const doctorAvailability = await Availability.findOne({ doctorId });

    if (!doctorAvailability) return res.json([]);

    const dayKey = Object.keys(doctorAvailability.availability).find(
      (k) => k.toLowerCase() === dayName
    );
    const daySchedule = doctorAvailability.availability?.[dayKey];

    if (!daySchedule?.enabled) return res.json([]);

    const slots = generateSlots(
      daySchedule.slots,
      doctorAvailability.consultationDuration,
      doctorAvailability.breakTime
    );

    // Remove already booked slots
    const booked = await Appointment.find({
      doctorId,
      date,
      status: { $ne: "cancelled" },
    }).select("time");

    const bookedTimes = booked.map((b) => b.time);
    const available = slots.filter((s) => !bookedTimes.includes(s));

    res.json(available);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET MY APPOINTMENTS (PATIENT)

export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { status } = req.query;

    const filter = { patientId };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name speciality fees experience")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL APPOINTMENT (PATIENT)

export const cancelAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({ _id: id, patientId });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY DOCTORS (PATIENT)

export const getMyDoctors = async (req, res) => {
  try {
    const patientId = req.user.id;

    const doctorIds = await Appointment.distinct("doctorId", {
      patientId,
      status: { $ne: "cancelled" },
    });

    const doctors = await User.find({ _id: { $in: doctorIds } }).select(
      "name email speciality fees experience"
    );

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  ACCEPT / REJECT APPOINTMENT (DOCTOR)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'confirmed' or 'cancelled'" });
    }

    const appointment = await Appointment.findOne({ _id: id, doctorId });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Cannot update a completed appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: `Appointment ${status} successfully`, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  MARK AS COMPLETED (DOCTOR)
export const markAsCompleted = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({ _id: id, doctorId });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Cannot complete a cancelled appointment" });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({ message: "Appointment is already completed" });
    }

    appointment.status = "completed";
    await appointment.save();

    res.json({ message: "Appointment marked as completed", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
