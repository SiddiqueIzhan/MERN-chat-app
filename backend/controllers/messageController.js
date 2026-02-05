import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      return res
        .status(400)
        .send("Please send a message with a chatId and text");
    }

    let message = await Message.create({
      senderName: req.user._id,
      text,
      chat: chatId,
    });

    message = await message.populate(
      "senderName",
      "username profile_pic email",
    );
    message = await message.populate("chat");
    message = await message.populate({
      path: "chat.users",
      select: "username profile_pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    return res.status(200).json(message);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMessageByChatId = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    return res.status(400).send("chatId required");
  }

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("senderName", "username profile_pic email")
      .populate("chat");

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
