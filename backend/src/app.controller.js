import connectionDB from "./DB/dbConnection.js";
import { globalerrorhandling } from "./utils/globalErrorHandling/index.js";
import {
  apiLimiter,
  authLimiter,
  chatLimiter,
  uploadLimiter,
} from "./middleware/rateLimit.js";

import authRouter from "./module/auth/auth.controller.js";
import userRouter from "./module/user/user.controller.js";
import postRouter from "./module/post/post.controller.js";
import sightingRouter from "./module/sightingReport/sightingReport.controller.js";
import claimRouter from "./module/claim/claim.controller.js";
import notificationRouter from "./module/notification/notification.controller.js";
import chatRouter from "./module/chat/chat.controller.js";
import adminRouter from "./module/admin/admin.controller.js";

const bootstrap = async (app, express) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await connectionDB();

  app.get("/", (req, res) =>
    res.status(200).json({ message: "UNIFY API is running" }),
  );

  // Apply rate limiting
  app.use("/api/auth", authLimiter);
  app.use("/api/chats", chatLimiter);
  app.use("/api/posts", uploadLimiter); // For file uploads in posts
  app.use("/api", apiLimiter); // General API rate limiting

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/posts", postRouter);
  app.use("/api/sightings", sightingRouter);
  app.use("/api/claims", claimRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/chats", chatRouter);
  app.use("/api/admin", adminRouter);

  app.use(globalerrorhandling);
};

export default bootstrap;
