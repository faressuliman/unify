import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { authenticate, authorization } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { multerHost, multerMemory, filetypes } from "../../middleware/multer.js";
import { createPostSchema, updatePostSchema, getPostsSchema } from "./post.validation.js";
import * as postService from "./post.service.js";

const router = Router();

// Public
router.get("/", validation(getPostsSchema), asynchandler(postService.getPosts));

router.post(
  "/search-by-face",
  multerMemory(filetypes.image).single("image"),
  asynchandler(postService.searchByFace)
);

router.get("/map-markers", asynchandler(postService.getMapMarkers));
router.get("/:id", asynchandler(postService.getPostById));

// Auth required
router.post(
  "/",
  authenticate,
  multerHost(filetypes.image, "unify/posts").array("photos", 5),
  validation(createPostSchema),
  asynchandler(postService.createPost)
);

router.put(
  "/:id",
  authenticate,
  validation(updatePostSchema),
  asynchandler(postService.updatePost)
);

router.delete("/:id", authenticate, asynchandler(postService.deletePost));

export default router;
