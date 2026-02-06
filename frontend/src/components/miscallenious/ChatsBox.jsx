import React, { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import { Eye, Pencil } from "lucide-react";
import { chatContext } from "../../AppContext/context";
import ProfileModal from "./ProfileModal";
import GroupChatModal from "./GroupChatModal";
import { useRef } from "react";
import { getAllMessages, sendMessage } from "../../api/message.api";
import { io } from "socket.io-client";
import Lottie from "lottie-react";
import animationData from "../../animations/Typing.json";
import { postNotification } from "../../api/notification.api";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "react-toastify";

const ChatsBox = () => {
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [latestMessage, setLatestMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connectedSocket, setConnectedSocket] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loadMessages, setLoadMessages] = useState(false);
  const socketRef = useRef(null);
  const selectedChatCompareRef = useRef(null);
  const messagesEndRef = useRef(null);
  const {
    user,
    profileUser,
    setProfileUser,
    selectedChat,
    setSelectedChat,
    fetchAgain,
    setFetchAgain,
    notifications,
    setNotifications,
  } = chatContext();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL);

    socketRef.current.emit("Setup", user);

    socketRef.current.on("connected", () => {
      setConnectedSocket(true);
    });

    socketRef.current.on("typing", () => setIsTyping(true));
    socketRef.current.on("stop typing", () => setIsTyping(false));

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchAllMessages();
    selectedChatCompareRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socketRef.current.on("message recieved", async (newMessageRecieved) => {
      const currentChat = selectedChatCompareRef.current;

      if (!currentChat || currentChat._id !== newMessageRecieved.chat._id) {
        if (!notifications.includes(newMessageRecieved)) {
          const data = await createNotification({
            messageId: newMessageRecieved._id,
            chatId: newMessageRecieved.chat._id,
          });
          setNotifications((prev) => [...prev, data]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMessageRecieved]);
      }
    });

    return () => {
      socketRef.current.off("message received");
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const fetchAllMessages = async () => {
    setLoadMessages(true);
    try {
      if (selectedChat) {
        const { data } = await getAllMessages(selectedChat._id);
        setMessages(data);
        socketRef.current.emit("Join Chat", selectedChat._id);
        setLoadMessages(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleSendMessage = async () => {
    if (!latestMessage.trim()) {
      return;
    }
    try {
      const { data } = await sendMessage({
        chatId: selectedChat._id,
        text: latestMessage,
      });
      socketRef.current.emit("stop typing", selectedChat._id);
      socketRef.current.emit("New Message", data);
      setMessages([...messages, data]);
      setLatestMessage("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const createNotification = async ({ messageId, chatId }) => {
    try {
      const { data } = await postNotification({
        userId: user._id,
        messageId: messageId,
        chatId: chatId,
      });
      return data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevents newline
      handleSendMessage();
    }
  };

  const typeHandler = (event) => {
    setLatestMessage(event.target.value);

    //typing logic
    if (connectedSocket && !typing) {
      setTyping(true);
      socketRef.current.emit("typing", selectedChat._id);
      const initTime = new Date().getTime();
      const timeLength = 3000;
      setTimeout(() => {
        let currTime = new Date().getTime();
        let timeDiff = currTime - initTime;
        if (timeDiff >= timeLength) {
          socketRef.current.emit("stop typing", selectedChat._id);
          setTyping(false);
        }
      }, timeLength);
    }
  };

  if (!selectedChat) {
    return (
      <div
        className={`${selectedChat ? "flex" : "hidden"}
            md:flex md:w-3/4 w-full h-[80vh] bg-white rounded-3xl items-center justify-center`}
      >
        <h1 className="text-gray-400 text-2xl">
          Select a chat to start messaging
        </h1>
      </div>
    );
  }

  // 👉 Get other user in 1-to-1 chat
  const otherUser = !selectedChat.isGroupChat
    ? selectedChat.users.find((u) => u._id !== user._id)
    : null;

  return (
    <div
      className={`${selectedChat ? "flex" : "hidden"}
            md:flex md:w-3/4 w-full h-[80vh] flex-col justify-between bg-white rounded-3xl relative overflow-hidden`}
    >
      {/* Header */}
      <div className="min-h-16 flex items-center justify-between px-4 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedChat(null)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-lg font-semibold">
            {selectedChat.isGroupChat
              ? selectedChat.chatName
              : otherUser?.username}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              selectedChat.isGroupChat
                ? setProfileUser({
                    title: selectedChat.chatName,
                    desc: selectedChat.groupAdmin.username,
                    image:
                      "https://cdn-icons-png.flaticon.com/512/681/681494.png",
                    users: selectedChat.users.filter(
                      (u) => u._id !== selectedChat.groupAdmin._id,
                    ),
                  })
                : setProfileUser({
                    title: otherUser.username,
                    desc: otherUser.email,
                    image: otherUser.profile_pic,
                  });
            }}
            className="p-2 rounded-full hover:bg-gray-100"
            title="View profile"
          >
            <Eye size={20} />
          </button>

          {/* Action Button */}
          {!selectedChat.isGroupChat ? (
            <></>
          ) : (
            <button
              onClick={() => setOpenGroupModal(true)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Pencil size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages (placeholder) */}
      {loadMessages ? (
        <div className="w-full h-full flex items-center justify-center absolute bg-gray-100">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-100 border-t-black"></div>
        </div>
      ) : (
        <div
          className={`w-full h-4/5 flex flex-col gap-4 px-4 pb-10 overflow-y-auto no-scrollbar`}
        >
          {messages.map(({ _id, senderName, text, createdAt }) => {
            const isSender = senderName._id === user._id;

            return (
              <div
                key={_id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                {!isSender && (
                  <img
                    src={senderName.profile_pic}
                    alt={senderName.username}
                    className="w-8 h-8 rounded-full mr-2 self-end"
                  />
                )}

                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow 
          ${
            isSender
              ? "bg-green-500 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
                >
                  {selectedChat.isGroupChat && !isSender && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {senderName.username}
                    </p>
                  )}

                  <p className="text-sm">{text}</p>

                  <p className="text-[10px] text-right mt-1 opacity-70">
                    {new Date(createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {/* ✅ Typing indicator goes OUTSIDE the map */}
          <span className="w-70 relative left-[-15%] ml-10">
            {isTyping && otherUser ? (
              <Lottie options={defaultOptions} width={70} />
            ) : (
              <></>
            )}
            {/* ✅ Single ref at the very end */}
          </span>
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter message"
            className="flex-1 p-3 bg-gray-100 rounded-xl"
            value={latestMessage}
            onChange={typeHandler}
            onKeyDown={handleKeyDown}
          />
          <button
            className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center"
            onClick={handleSendMessage}
          >
            <IoSend />
          </button>
        </div>
      </div>

      {/* Modals */}
      {profileUser && (
        <ProfileModal
          profileUser={profileUser}
          isGroupChat={selectedChat.isGroupChat}
        />
      )}

      {openGroupModal && (
        <GroupChatModal
          setOpen={setOpenGroupModal}
          isEdit={true}
          selectedChat={selectedChat}
        />
      )}
    </div>
  );
};

export default ChatsBox;
