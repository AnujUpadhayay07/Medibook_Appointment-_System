
import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import User from "../models/User.js"; 



// ==========================
// GET /api/doctor/availability (Doctor self)
// ==========================
export const getAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;

    let data = await Availability.findOne({ doctorId });

    // ✅ Create default availability if not exists
    if (!data) {
      data = await Availability.create({
        doctorId,
        availability: {
          Monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Saturday: { enabled: false, slots: [] },
          Sunday: { enabled: false, slots: [] },
        },
        consultationDuration: 30,
        maxPatientsPerDay: 20,
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// PUT /api/doctor/availability
// ==========================
export const saveAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { availability, consultationDuration, maxPatientsPerDay, breakTime } = req.body;

    const updated = await Availability.findOneAndUpdate(
      { doctorId },
      {
        doctorId,
        availability,
        consultationDuration,
        maxPatientsPerDay,
        breakTime,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: "Saved successfully", data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// GET /api/doctor/availability/:doctorId (Patient view)
// ==========================
export const getAvailabilityForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    // ✅ Fetch doctor
    const doctor = await User.findById(doctorId).lean();
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ Fetch availability
    let availability = await Availability.findOne({ doctorId }).lean();

    // ✅ If NOT exists → create default
    if (!availability) {
      const newAvailability = await Availability.create({
        doctorId,
        availability: {
          Monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
          Saturday: { enabled: false, slots: [] },
          Sunday: { enabled: false, slots: [] },
        },
        consultationDuration: 30,
      });

      availability = newAvailability.toObject();
    }

    // ✅ SAFETY FIX (MOST IMPORTANT)
    const availabilityData = availability.availability || {};

    const consultationDuration = availability.consultationDuration || 30;

    const breakStart = availability.breakTime?.start || null;
    const breakEnd = availability.breakTime?.end || null;

    const timeToMinutes = (time) => {
      if (!time) return 0;
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const generateSlots = (start, end) => {
      if (!start || !end) return [];

      const slots = [];
      let current = timeToMinutes(start);
      const last = timeToMinutes(end);

      const breakStartMin = breakStart ? timeToMinutes(breakStart) : null;
      const breakEndMin = breakEnd ? timeToMinutes(breakEnd) : null;

      while (current + consultationDuration <= last) {
        // Skip break
        if (
          breakStartMin !== null &&
          breakEndMin !== null &&
          current < breakEndMin &&
          current + consultationDuration > breakStartMin
        ) {
          current = breakEndMin;
          continue;
        }

        const h = Math.floor(current / 60);
        const m = current % 60;

        slots.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );

        current += consultationDuration;
      }

      return slots;
    };

    const result = {};

    // ✅ SAFE LOOP
    for (const day in availabilityData) {
      const dayData = availabilityData[day] || {};
      const key = day.toLowerCase();

      if (dayData.enabled && Array.isArray(dayData.slots)) {
        result[key] = [];

        for (const slot of dayData.slots) {
          const generated = generateSlots(slot.start, slot.end);
          result[key].push(...generated);
        }
      } else {
        result[key] = [];
      }
    }

    console.log("Generated slots:", result); // 👈 DEBUG

    res.json({
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        speciality: doctor.speciality,
        fees: doctor.fees,
        experience: doctor.experience,
      },
      slots: result,
    });

  } catch (err) {
    console.error("🔥 ERROR:", err); // VERY IMPORTANT
    res.status(500).json({ message: err.message });
  }
};