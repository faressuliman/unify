import Chat from "../../DB/models/chat.model.js";
import Message from "../../DB/models/message.model.js";
import User from "../../DB/models/user.model.js";

// ─── Start or Get Chat ────────────────────────────────────────────────────────
export const startChat = async (req, res, next) => {
  const { responderId } = req.body;

  if (responderId === req.user._id.toString()) {
    return next(new Error("Cannot chat with yourself", { cause: 400 }));
  }

  const responder = await User.findById(responderId);
  if (!responder) return next(new Error("User not found", { cause: 404 }));

  // Check if chat already exists
  let chat = await Chat.findOne({
    $or: [
      { initiatorUserId: req.user._id, responderUserId: responderId },
      { initiatorUserId: responderId, responderUserId: req.user._id },
    ],
  });

  if (!chat) {
    chat = await Chat.create({
      initiatorUserId: req.user._id,
      responderUserId: responderId,
      isActive: true,
    });
  }

  return res.status(200).json({ chat });
};

// ─── Get My Chats ─────────────────────────────────────────────────────────────
export const getMyChats = async (req, res, next) => {
  const chats = await Chat.find({
    $or: [
      { initiatorUserId: req.user._id },
      { responderUserId: req.user._id },
    ],
    isActive: true,
  })
    .populate("initiatorUserId", "name")
    .populate("responderUserId", "name")
    .sort({ createdAt: -1 });

  return res.status(200).json({ chats });
};

// ─── Send Message ─────────────────────────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  const { chatId } = req.params;
  const { content } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new Error("Chat not found", { cause: 404 }));

  const isParticipant =
    chat.initiatorUserId.toString() === req.user._id.toString() ||
    chat.responderUserId.toString() === req.user._id.toString();

  if (!isParticipant) return next(new Error("Unauthorized", { cause: 403 }));

  const attachmentPath = req.file?.path;

  if (!content && !attachmentPath) {
    return next(new Error("Message must have content or attachment", { cause: 400 }));
  }

  const message = await Message.create({
    chatId,
    senderUserId: req.user._id,
    content,
    attachmentPath,
  });

  return res.status(201).json({ message });
};

// ─── Get Chat Messages ────────────────────────────────────────────────────────
export const getChatMessages = async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new Error("Chat not found", { cause: 404 }));

  const isParticipant =
    chat.initiatorUserId.toString() === req.user._id.toString() ||
    chat.responderUserId.toString() === req.user._id.toString();

  if (!isParticipant) return next(new Error("Unauthorized", { cause: 403 }));

  const { page = 1, limit = 20 } = req.query;
  const messages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .populate("senderUserId", "name");

  return res.status(200).json({ messages: messages.reverse() });
};
