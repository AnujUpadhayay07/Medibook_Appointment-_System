import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  phone:      { type: String },
  dob:        { type: Date },

  gender:     { type: String },
  weight:     { type: String },
  height:     { type: String },
  country:    { type: String },
  state:      { type: String },
  city:       { type: String },
  pincode:    { type: String },
  emergency:  { type: String },

  experience: { type: Number },

  // NEW STATUS FIELD (MAIN CHANGE)
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  // KEEP TEMPORARILY (for migration safety)
  
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  speciality: { type: String },
  fees:       { type: Number },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
