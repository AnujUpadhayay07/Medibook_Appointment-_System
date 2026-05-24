import mongoose from "mongoose";

const doseSchema = new mongoose.Schema({
  time: String,
  taken: {
    type: Boolean,
    default: false,
  },
});

const dailyLogSchema = new mongoose.Schema({
  date: String, // "YYYY-MM-DD"
  doses: [doseSchema],
});

const medicineSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    timing: {
      type: [String], // ["Morning", "Night"]
      required: true,
    },

    duration: {
      type: Number,
      default: 1,
    },

    instructions: {
      type: String,
      default: "",
    },

    
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    dailyLogs: [dailyLogSchema], // track per day
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);