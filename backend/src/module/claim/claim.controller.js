import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { authenticate, authorization } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { multerHost, filetypes } from "../../middleware/multer.js";
import { roles } from "../../middleware/enum.js";
import {
  createClaimSchema,
  reviewClaimSchema,
  aiReviewSchema,
} from "./claim.validation.js";
import * as claimService from "./claim.service.js";

const router = Router();

router.post(
  "/",
  authenticate,
  multerHost([...filetypes.image, ...filetypes.document], "unify/claims").single("document"),
  validation(createClaimSchema),
  asynchandler(claimService.createClaim)
);

router.get("/my", authenticate, asynchandler(claimService.getMyClaims));

router.get(
  "/post/:postId",
  authenticate,
  asynchandler(claimService.getClaimsByPost)
);

// Admin only
router.post(
  "/:id/ai-review",
  authenticate,
  authorization([roles.admin]),
  validation(aiReviewSchema),
  asynchandler(claimService.aiReviewClaim)
);

router.post(
  "/:id/admin-review",
  authenticate,
  authorization([roles.admin]),
  validation(reviewClaimSchema),
  asynchandler(claimService.adminReviewClaim)
);

export default router;
