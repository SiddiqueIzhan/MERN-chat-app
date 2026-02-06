import React, { useEffect, useState } from "react";
import axios from "axios";
import { chatContext } from "../AppContext/context";
import MyChats from "../components/miscallenious/MyChats";
import ChatsBox from "../components/miscallenious/ChatsBox";
import TopBar from "../components/miscallenious/TopBar";
import SideDrawer from "../components/miscallenious/SideDrawer";
import { toast, ToastContainer } from "react-toastify";
import { accessChat, getAllChats, getAllChatsById } from "../api/chat.api";
import { deleteNotifications } from "../api/notification.api";

const Chat = () => {
  const [usersDrawer, setUsersDrawer] = useState(false);
  const [loadChats, setLoadChats] = useState(false);
  const {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchAgain,
    groupName,
    notifications,
    setNotifications,
  } = chatContext();
  useEffect(() => {
    fetchChats();

    if (selectedChat && groupName && selectedChat.chatName !== groupName) {
      setSelectedChat({ ...selectedChat, chatName: groupName });
    }
  }, [user, fetchAgain]);

  const clearNotifications = async (chatId) => {
    try {
      await deleteNotifications({ chatId });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleAccessChat = async (userId) => {
    try {
      const { data } = await accessChat({ userId });
      setSelectedChat(data);

      if (notifications.some((n) => n.chat._id === data._id)) {
        await clearNotifications(data._id);
        setNotifications((prev) => prev.filter((n) => n.chat._id !== data._id));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleAccessGroup = async (chatId) => {
    try {
      const { data } = await getAllChatsById(chatId);
      setSelectedChat(data);

      if (notifications.some((n) => n.chat._id === data._id)) {
        await clearNotifications(data._id);
        setNotifications((prev) => prev.filter((n) => n.chat._id !== data._id));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const fetchChats = async () => {
    setLoadChats(true);
    try {
      const { data } = await getAllChats();
      setChats(data);
      setLoadChats(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-4 p-4 relative">
        {usersDrawer && (
          <SideDrawer
            usersDrawer={usersDrawer}
            setUsersDrawer={setUsersDrawer}
            handleAccessChat={handleAccessChat}
          />
        )}
        <TopBar
          setUsersDrawer={setUsersDrawer}
          handleAccessChat={handleAccessChat}
          handleAccessGroup={handleAccessGroup}
        />
        <div className="flex gap-4">
          <MyChats
            chats={chats}
            selectedChat={selectedChat}
            handleAccessChat={handleAccessChat}
            handleAccessGroup={handleAccessGroup}
            loadChats={loadChats}
          />
          <ChatsBox />
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Chat;
