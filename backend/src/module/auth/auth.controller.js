import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { validation } from "../../middleware/validation.js";
import { multerHost, multerMemory, filetypes } from "../../middleware/multer.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./auth.validation.js";
import * as authService from "./auth.service.js";

const router = Router();

router.post(
  "/register",
  multerMemory(filetypes.image).single("idPicture"),
  validation(registerSchema),
  asynchandler(authService.register)
);

router.post("/login", validation(loginSchema), asynchandler(authService.login));

router.post(
  "/forgot-password",
  validation(forgotPasswordSchema),
  asynchandler(authService.forgotPassword)
);

router.post(
  "/verify-otp",
  validation(verifyOtpSchema),
  asynchandler(authService.verifyOtp)
);

router.post(
  "/reset-password",
  validation(resetPasswordSchema),
  asynchandler(authService.resetPassword)
);

export default router;
