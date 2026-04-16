import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    initiatorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    responderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
