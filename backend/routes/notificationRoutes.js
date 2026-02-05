import { Router } from "express";
import { deleteNotifications, getAllNotifications, postNotification } from "../controllers/notificationController.js";
import { protect } from "../middleware/users.middleware.js";

const notificationRouter = new Router();

notificationRouter.get("/", protect, getAllNotifications);

notificationRouter.post("/", protect, postNotification);

export default notificationRouter

notificationRouter.delete("/", protect, deleteNotifications);
