import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

//  REGISTER
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      speciality,
      fees,
      experience, // ADDED
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const safeRole = role === "admin" ? "patient" : role;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: safeRole,
      phone,

      speciality: safeRole === "doctor" ? speciality : undefined,
      fees: safeRole === "doctor" ? fees : undefined,

      // FIXED (THIS WAS MISSING)
      experience: safeRole === "doctor" ? Number(experience) : undefined,

      //  NEW STATUS SYSTEM
      status: safeRole === "doctor" ? "pending" : "approved",

      //  KEEP TEMP (for backward compatibility)
      isApproved: safeRole === "doctor" ? false : true,
    });

    res.status(201).json({
      token: generateToken(user),
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Wrong password" });
    }

  //  BLOCKED USER CHECK (ADD HERE)
  if (!user.isActive) {
    return res.status(403).json({ message: "Account is blocked by admin" });
  }

    //  UPDATED APPROVAL CHECK
    if (user.role === "doctor" && user.status !== "approved") {
      return res.status(403).json({
        message: "Account pending admin approval",
      });
    }

    res.json({
      token: generateToken(user),
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  GET PROFILE
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    //  Prevent role change
    if (req.body.role) delete req.body.role;

    //  Hash password if updating
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  GET APPROVED DOCTORS (FOR PATIENT)
export const getDoctors = async (req, res) => {
  try {
    const { speciality } = req.query;

    let filter = {
      role: "doctor",
      status: "approved", //  UPDATED
    };

    if (speciality && speciality !== "all") {
      filter.speciality = speciality;
    }

    const doctors = await User.find(filter).select(
      "name speciality fees experience"
    );

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
