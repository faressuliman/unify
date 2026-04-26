import Notification from "../../DB/models/notification.model.js";
import { emitToUser } from "../../realtime/io.js";

// ─── Get My Notifications ─────────────────────────────────────────────────────
export const getMyNotifications = async (req, res, next) => {
  const { page, limit } = req.query;

  const notifications = await Notification.find({ userId: req.user._id })
    .populate("postId", "name postType")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) || 20)
    .skip(((parseInt(page) || 1) - 1) * (parseInt(limit) || 20));

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  return res.status(200).json({ notifications, unreadCount });
};

// ─── Mark Single Notification as Read ─────────────────────────────────────────
export const markOneRead = async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    return next(new Error("Notification not found", { cause: 404 }));
  }
  if (notification.userId.toString() !== req.user._id.toString()) {
    return next(new Error("Unauthorized", { cause: 403 }));
  }

  notification.isRead = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });
  emitToUser(req.user._id, "notification:unread-count", { unreadCount });

  return res.status(200).json({ message: "Notification marked as read", notification });
};

// ─── Mark All as Read ─────────────────────────────────────────────────────────
export const markAllRead = async (req, res, next) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  emitToUser(req.user._id, "notification:unread-count", { unreadCount: 0 });
  return res.status(200).json({ message: "All notifications marked as read" });
};
