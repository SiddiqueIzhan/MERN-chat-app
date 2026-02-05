import { Router } from "express";
import { protect } from "../middleware/users.middleware.js";
import {
  accessChat,
  addUserToGroup,
  changeAdmin,
  createGroupChat,
  fetchChats,
  getChatById,
  removeUser,
  renameGroupChat,
} from "../controllers/chatController.js";

const chatRouter = new Router();

chatRouter.post("/", protect, accessChat);
chatRouter.get("/", protect, fetchChats);
chatRouter.get("/:chatId", protect, getChatById);
chatRouter.post("/group", protect, createGroupChat);
chatRouter.put("/group/rename", protect, renameGroupChat);
chatRouter.put("/group/add", protect, addUserToGroup);
chatRouter.put("/group/remove", protect, removeUser);
chatRouter.put("/group/admin", protect, changeAdmin);

export default chatRouter;
