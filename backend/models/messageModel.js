import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderName: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  { timestamps: true },
);

const Message = new mongoose.model("Message", messageSchema);
export default Message;
