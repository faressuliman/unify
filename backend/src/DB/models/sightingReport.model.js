import mongoose from "mongoose";

const sightingReportSchema = new mongoose.Schema(
  {
    missingPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    confidence: {
      type: String,
      enum: ["not_sure", "possibly", "pretty_sure", "very_sure"],
      required: true,
    },
    seenAt: { type: String, required: true },
    location: {
      address: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    description: { type: String, required: true },
    additionalDetails: { type: String },
    reporterName: { type: String, required: true },
    reporterPhone: { type: String, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const SightingReport = mongoose.model("SightingReport", sightingReportSchema);
export default SightingReport;
