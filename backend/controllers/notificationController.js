import Notification from "../models/notificationModel.js";

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "message",
        populate: [{ path: "senderName", select: "username profile_pic" }],
      })
      .populate("chat", "chatName isGroupChat");

    if (!notifications) {
      return res.status(200).json({ message: "No New Messages" });
    }
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const postNotification = async (req, res) => {
  try {
    const { messageId, userId, chatId } = req.body;

    // 1️⃣ Create notification
    const notification = await Notification.create({
      user: userId,
      message: messageId,
      chat: chatId,
    });

    // 2️⃣ Populate notification with full message details
    const fullNotification = await Notification.findById(notification._id)
      .populate({
        path: "message",
        populate: [{ path: "senderName", select: "username profile_pic" }],
      })
      .populate("chat", "chatName isGroupChat");

    return res.status(201).json(fullNotification);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    const result = await Notification.deleteMany({
      user: req.user._id,
      chat: chatId,
    });

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
