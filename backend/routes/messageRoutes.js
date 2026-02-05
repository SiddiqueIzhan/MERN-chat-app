import { Router } from "express";
import { protect } from "../middleware/users.middleware.js";
import {
  getMessageByChatId,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.post("/", protect, sendMessage);

messageRouter.get("/:chatId", protect, getMessageByChatId);

export default messageRouter;
