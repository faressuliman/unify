import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String },
    attachmentPath: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
