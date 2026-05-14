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

// --- إنشاء طلب (Claim) جديد ---
// التعديل: ملتر هنا هو اللي هيستقبل "document" عشان الـ OCR يشتغل في الـ Service
router.post(
  "/",
  authenticate,
  multerHost(
    [...filetypes.image, ...filetypes.document],
    "unify/claims",
  ).single("document"),
  validation(createClaimSchema),
  asynchandler(claimService.createClaim), // دي الدالة اللي كتبناها وبها الـ Tesseract
);

// جلب طلباتي (لليوزر العادي)
router.get("/my", authenticate, asynchandler(claimService.getMyClaims));

// جلب الطلبات الخاصة ببوست معين (للأدمن أو صاحب البوست)
router.get(
  "/post/:postId",
  authenticate,
  asynchandler(claimService.getClaimsByPost),
);

// ==========================================
// Admin Only Routes (لوحة تحكم الأدمن)
// ==========================================

// مراجعة الـ AI (لو عايز تخلي الأدمن يطلب إعادة فحص الـ OCR يدوياً)
router.post(
  "/:id/ai-review",
  authenticate,
  authorization([roles.admin]),
  validation(aiReviewSchema),
  asynchandler(claimService.aiReviewClaim),
);

// المراجعة النهائية للأدمن (الموافقة أو الرفض النهائي)
router.post(
  "/:id/admin-review",
  authenticate,
  authorization([roles.admin]),
  validation(reviewClaimSchema),
  asynchandler(claimService.adminReviewClaim),
);

export default router;
