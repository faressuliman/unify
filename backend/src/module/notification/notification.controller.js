import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { authenticate } from "../../middleware/auth.js";
import * as notificationService from "./notification.service.js";

const router = Router();

router.get("/", authenticate, asynchandler(notificationService.getMyNotifications));
router.patch("/read-all", authenticate, asynchandler(notificationService.markAllRead));
router.patch("/:id/read", authenticate, asynchandler(notificationService.markOneRead));

export default router;
