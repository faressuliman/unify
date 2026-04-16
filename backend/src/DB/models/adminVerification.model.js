import mongoose from "mongoose";

const adminVerificationSchema = new mongoose.Schema({
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Claim",
    required: true,
    unique: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  result: { type: String, enum: ["approved", "rejected"] },
  notes: { type: String },
  verifiedAt: { type: Date },
});

const AdminVerification = mongoose.model(
  "AdminVerification",
  adminVerificationSchema
);
export default AdminVerification;
