import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    referenceId: { type: String },
    type: {
      type: String,
      enum: ["new_sighting", "new_claim", "claim_approved", "claim_approved_owner", "claim_rejected"],
      required: true,
    },
    isRead: { type: Boolean, default: false },
    deliveredVia: { type: String, enum: ["email", "push", "in-app"], default: "in-app" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
