import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    birthDate: { type: Date },
    email: { type: String, required: true, unique: true, lowercase: true },
    city: { type: String },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    idImagePath: { type: String },
    profilePicture: { type: String, default: null },

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    isVerified: { type: Boolean, default: false },
    isdeleted: { type: Boolean, default: false },
    isbanned: { type: Boolean, default: false },
    changeCredentialsTime: { type: Date, default: Date.now },
    lastLoginAt: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } },
);

const User = mongoose.model("User", userSchema);
export default User;
