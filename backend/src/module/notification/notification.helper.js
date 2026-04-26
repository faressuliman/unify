import Notification from "../../DB/models/notification.model.js";
import { emitToUser } from "../../realtime/io.js";

// Single entry point for creating an in-app notification so that we can
// guarantee a real-time broadcast happens alongside persistence.
export const createNotification = async ({ userId, postId, type, deliveredVia }) => {
  const notification = await Notification.create({
    userId,
    postId,
    type,
    ...(deliveredVia ? { deliveredVia } : {}),
  });

  // Re-fetch with a populated post so the client can show the post name in
  // the toast / notifications list without an extra round-trip.
  const populated = await Notification.findById(notification._id).populate(
    "postId",
    "name postType"
  );

  emitToUser(userId, "notification:new", populated);

  // Also let the client keep a live unread badge counter in sync.
  const unreadCount = await Notification.countDocuments({
    userId,
    isRead: false,
  });
  emitToUser(userId, "notification:unread-count", { unreadCount });

  return populated;
};
