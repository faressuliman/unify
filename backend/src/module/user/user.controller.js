import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { authenticate } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { multerHost, filetypes } from "../../middleware/multer.js";
import { updateProfileSchema } from "./user.validation.js";
import * as userService from "./user.service.js";

const router = Router();

router.get("/profile", authenticate, asynchandler(userService.getProfile));

router.put(
  "/profile",
  authenticate,
  multerHost(filetypes.image, "unify/ids").single("idPicture"),
  validation(updateProfileSchema),
  asynchandler(userService.updateProfile),
);

router.post(
  "/verify-email",
  authenticate,
  asynchandler(userService.verifyEmail),
);

router.get("/blocked", authenticate, asynchandler(userService.getBlockedUsers));

router.post(
  "/:userId/unblock",
  authenticate,
  asynchandler(userService.unblockUser),
);

router.post(
  "/:userId/block",
  authenticate,
  asynchandler(userService.blockUser),
);

export default router;
