const chats = {
  chatId: "chat_001",
  participants: [
    {
      id: "user_1",
      name: "Arjun",
    },
    {
      id: "user_2",
      name: "Rahul",
    },
  ],
  messages: [
    {
      messageId: "msg_1",
      senderId: "user_1",
      text: "Hey Rahul, did you finish the task?",
      timestamp: "2026-01-05T10:00:00Z",
    },
    {
      messageId: "msg_2",
      senderId: "user_2",
      text: "Almost done, just fixing a small bug.",
      timestamp: "2026-01-05T10:01:20Z",
    },
    {
      messageId: "msg_3",
      senderId: "user_1",
      text: "Cool. Let me know once it’s ready.",
      timestamp: "2026-01-05T10:02:10Z",
    },
    {
      messageId: "msg_4",
      senderId: "user_2",
      text: "Sure, will push the code in 10 minutes.",
      timestamp: "2026-01-05T10:03:05Z",
    },
    {
      messageId: "msg_5",
      senderId: "user_1",
      text: "Great, thanks!",
      timestamp: "2026-01-05T10:04:00Z",
    },
  ],
};

export default chats;
