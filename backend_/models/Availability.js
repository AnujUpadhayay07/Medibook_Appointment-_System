import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    start: { type: String, default: "09:00" },
    end:   { type: String, default: "17:00" },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    slots:   { type: [slotSchema], default: [{ start: "09:00", end: "17:00" }] },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    availability: {
      monday:    { type: daySchema, default: () => ({}) },
      tuesday:   { type: daySchema, default: () => ({}) },
      wednesday: { type: daySchema, default: () => ({}) },
      thursday:  { type: daySchema, default: () => ({}) },
      friday:    { type: daySchema, default: () => ({}) },
      saturday:  { type: daySchema, default: () => ({}) },
      sunday:    { type: daySchema, default: () => ({}) },
    },
    consultationDuration: { type: Number, default: 30 },
    maxPatientsPerDay:    { type: Number, default: 20  },
    breakTime: {
      start: { type: String, default: "13:00" },
      end:   { type: String, default: "14:00" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Availability", availabilitySchema);