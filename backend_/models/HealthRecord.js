import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema(
  {
    // 👤 Patient
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 👨‍⚕️ Doctor who created this record
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 📅 Linked appointment (VERY IMPORTANT)
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },

    // ❤️ Vitals (dynamic fields)
    // Example: { bp: "120/80", sugar: "95" }
    records: {
      type: Map,
      of: String,
      default: {}
    },

    // 📊 Overall health status (by doctor)
    status: {
      type: String,
      enum: ["Good", "Normal", "Bad"],
      default: "Normal"
    },

    // 📝 Doctor notes
    notes: {
      type: String,
      trim: true,
      default: ""
    },

    // 📄 Uploaded report (optional)
    fileUrl: {
      type: String,
      default: ""
    }

  },
  {
    timestamps: true // ✅ gives createdAt (used for sorting + history)
  }
);

export default mongoose.model("HealthRecord", healthRecordSchema);