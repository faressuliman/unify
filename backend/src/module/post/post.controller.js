import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { authenticate, authorization } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { multerHost, filetypes } from "../../middleware/multer.js";
import {
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
} from "./post.validation.js";
import * as postService from "./post.service.js";

const router = Router();

// ==========================================
// Public Routes (متاحة للجميع بدون Token)
// ==========================================

// جلب كل المنشورات
router.get("/", validation(getPostsSchema), asynchandler(postService.getPosts));

// جديد: جلب كل نقاط الخريطة (الـ 102 حالة والـ 43 حالة)
router.get("/public-map", asynchandler(postService.getPublicMap));

// جديد: جلب الإحصائيات الحية للهوم بيدج (الأرقام الحقيقية من الـ DB)
router.get("/public-stats", asynchandler(postService.getPublicStats));

// البحث بالصور
router.post(
  "/search-image",
  multerHost(filetypes.image, "unify/search_temp").single("searchImage"),
  asynchandler(postService.searchByImage),
);

router.get("/map-markers", asynchandler(postService.getMapMarkers));
router.get("/:id", asynchandler(postService.getPostById));

// ==========================================
// Auth Required Routes (تحتاج تسجيل دخول)
// ==========================================

router.post(
  "/",
  authenticate,
  multerHost(filetypes.image, "unify/posts").array("photos", 5),
  validation(createPostSchema),
  asynchandler(postService.createPost),
);

router.put(
  "/:id",
  authenticate,
  validation(updatePostSchema),
  asynchandler(postService.updatePost),
);

router.delete("/:id", authenticate, asynchandler(postService.deletePost));

export default router;
