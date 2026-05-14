import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { validation } from "../../middleware/validation.js";
import { multerHost, filetypes } from "../../middleware/multer.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import * as authService from "./auth.service.js";

const router = Router();
router.post(
  "/register",
  // Use the imported multerHost instead of CommonJS require
  multerHost(filetypes?.image || []).fields([
    {
      name: "idPicture",
      maxCount: 1,
    },
    {
      name: "selfiePicture",
      maxCount: 1,
    },
  ]),
  asynchandler(authService.register),
);

router.post("/login", validation(loginSchema), asynchandler(authService.login));

router.post(
  "/forgot-password",
  validation(forgotPasswordSchema),
  asynchandler(authService.forgotPassword),
);

router.post(
  "/reset-password",
  validation(resetPasswordSchema),
  asynchandler(authService.resetPassword),
);

export default router;
