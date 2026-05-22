import { Router } from "express";
import { asynchandler } from "../../utils/globalErrorHandling/index.js";
import { authenticate } from "../../middleware/auth.js";
import { multerHost, filetypes } from "../../middleware/multer.js";
import * as chatService from "./chat.service.js";

const router = Router();

router.post("/", authenticate, asynchandler(chatService.startChat));
router.get("/", authenticate, asynchandler(chatService.getMyChats));

router.post(
  "/:chatId/messages",
  authenticate,
  multerHost(filetypes.image, "unify/attachments").single("attachment"),
  asynchandler(chatService.sendMessage),
);

router.get(
  "/:chatId/messages",
  authenticate,
  asynchandler(chatService.getChatMessages),
);
router.delete("/:chatId", authenticate, asynchandler(chatService.deleteChat));

export default router;
