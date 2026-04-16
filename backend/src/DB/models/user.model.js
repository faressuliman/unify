import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    birthDate: { type: Date },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    idImagePath: { type: String },
    isVerified: { type: Boolean, default: false },
    isdeleted: { type: Boolean, default: false },
    isbanned: { type: Boolean, default: false },
    changeCredentialsTime: { type: Date, default: Date.now },
    lastLoginAt: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const User = mongoose.model("User", userSchema);
export default User;
