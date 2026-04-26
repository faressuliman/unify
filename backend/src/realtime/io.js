import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../DB/models/user.model.js";

let io;

const userRoom = (userId) => `user:${userId}`;
const chatRoom = (chatId) => `chat:${chatId}`;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate every incoming socket using the same JWT we use for HTTP.
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization;

      if (!token) {
        return next(new Error("Missing auth token"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_SIGNATURE);
      if (!decoded?.id) {
        return next(new Error("Invalid token payload"));
      }

      const user = await User.findById(decoded.id).select(
        "_id role isbanned isdeleted changeCredentialsTime"
      );
      if (!user || user.isbanned || user.isdeleted) {
        return next(new Error("Account not allowed"));
      }

      const credentialsChangedAt = new Date(
        user.changeCredentialsTime
      ).getTime();
      if (decoded.iat * 1000 < credentialsChangedAt) {
        return next(new Error("Token expired"));
      }

      socket.data.userId = user._id.toString();
      socket.data.role = user.role;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // Personal room for direct events (notifications, chat fanout).
    socket.join(userRoom(userId));

    // Allow client to subscribe / unsubscribe to specific chat threads.
    socket.on("chat:join", (chatId) => {
      if (typeof chatId === "string" && chatId.length > 0) {
        socket.join(chatRoom(chatId));
      }
    });

    socket.on("chat:leave", (chatId) => {
      if (typeof chatId === "string" && chatId.length > 0) {
        socket.leave(chatRoom(chatId));
      }
    });

    // Lightweight typing indicator broadcast within a chat room.
    socket.on("chat:typing", ({ chatId, isTyping }) => {
      if (typeof chatId !== "string" || !chatId) return;
      socket.to(chatRoom(chatId)).emit("chat:typing", {
        chatId,
        userId,
        isTyping: !!isTyping,
      });
    });
  });

  return io;
};

export const getIO = () => io;

export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(userRoom(String(userId))).emit(event, payload);
};

export const emitToChat = (chatId, event, payload) => {
  if (!io || !chatId) return;
  io.to(chatRoom(String(chatId))).emit(event, payload);
};

export const emitToUsers = (userIds, event, payload) => {
  if (!io || !Array.isArray(userIds)) return;
  for (const id of userIds) {
    if (id) io.to(userRoom(String(id))).emit(event, payload);
  }
};
