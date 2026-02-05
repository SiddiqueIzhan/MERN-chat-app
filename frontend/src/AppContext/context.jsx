import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

const context = createContext();

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); 
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupUsers, setGroupUsers] = useState([]);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [fetchAgain, setFetchAgain] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    setUser(userInfo || null);
    setAuthLoading(false); // ✅ token check complete

    if (userInfo) navigate("/");
    else navigate("/login");
  }, [navigate, fetchAgain]);

  // 🚫 BLOCK UI until token is resolved
  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  return (
    <context.Provider
      value={{
        user,
        setUser,
        chats,
        setChats,
        profileUser,
        setProfileUser,
        groupName,
        setGroupName,
        groupUsers,
        setGroupUsers,
        openGroupModal,
        setOpenGroupModal,
        selectedChat, 
        setSelectedChat,
        fetchAgain,
        setFetchAgain,
        notifications,
        setNotifications
      }}
    >
      {children}
    </context.Provider>
  );
};

export const chatContext = () => useContext(context);
