import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    claimType: { type: String, required: true },
    additionalInfo: { type: String },
    claimUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: { type: Date },
    documentPath: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;
