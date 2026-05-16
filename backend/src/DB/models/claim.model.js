import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    claimUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    claimType: {
      type: String,
      required: true,
    },
    additionalInfo: {
      type: String,
    },
    documentPath: {
      type: String,
      required: true,
    },
    // --- حقول التحقق ---
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // -------------------------
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // الأدمن اللي وافق على الطلب نهائياً
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } },
);

const Claim = mongoose.model("Claim", claimSchema);
export default Claim;
