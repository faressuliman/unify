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

export default router;
