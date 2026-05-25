import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { validation } from "../../middleware/validation.js";
import { authenticate } from "../../middleware/auth.js";
import { createSightingSchema } from "./sightingReport.validation.js";
import * as sightingService from "./sightingReport.service.js";

const router = Router();

router.get("/user/my-sightings", authenticate, asynchandler(sightingService.getMySightings));

// Anyone can submit a sighting (no auth needed)
router.post(
  "/",
  validation(createSightingSchema),
  asynchandler(sightingService.createSighting)
);

// Auth required to view sightings (post owner or admin)
router.get("/:postId", authenticate, asynchandler(sightingService.getSightingsByPost));

export default router;
