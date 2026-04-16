import Notification from "../../DB/models/notification.model.js";

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

// ─── Mark All as Read ─────────────────────────────────────────────────────────
export const markAllRead = async (req, res, next) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  return res.status(200).json({ message: "All notifications marked as read" });
};
