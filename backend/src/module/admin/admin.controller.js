import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { authenticate, authorization } from "../../middleware/auth.js";
import { roles } from "../../middleware/enum.js";
import * as adminService from "./admin.service.js";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorization([roles.admin]));

router.get("/stats", asynchandler(adminService.getDashboardStats));
router.get("/users", asynchandler(adminService.getAllUsers));
router.patch("/users/:id/ban", asynchandler(adminService.toggleBanUser));
router.get("/claims/pending", asynchandler(adminService.getPendingClaims));
router.get("/claims", asynchandler(adminService.getAllClaims));

// Identity verification queue
router.get("/verifications/pending", asynchandler(adminService.getPendingVerifications));
router.post("/users/:id/verify", asynchandler(adminService.verifyUser));
router.post("/users/:id/reject-verification", asynchandler(adminService.rejectVerification));

// Post moderation
router.get("/posts", asynchandler(adminService.getAllPostsAdmin));

// Contact messages
router.get("/contact-messages", asynchandler(adminService.getContactMessages));
router.post("/contact-messages/:id/reply", asynchandler(adminService.replyToContactMessage));

// Moderation
router.get("/chats/:id", asynchandler(adminService.getChatDetails));
router.get("/chats/:id/messages", asynchandler(adminService.getChatMessages));

export default router;
