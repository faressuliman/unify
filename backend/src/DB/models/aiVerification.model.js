import mongoose from "mongoose";

const aiVerificationSchema = new mongoose.Schema({
  claimId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Claim",
    required: true,
    unique: true,
  },
  aiDecision: { type: String, enum: ["approved", "rejected", "uncertain"] },
  aiConfidenceScore: { type: Number, min: 0, max: 100 },
  notes: { type: String },
  verifiedAt: { type: Date },
  verificationType: { type: String },
});

const AIVerification = mongoose.model("AIVerification", aiVerificationSchema);
export default AIVerification;
