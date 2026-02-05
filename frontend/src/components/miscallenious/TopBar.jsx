import { Bell, Search } from "lucide-react";
import MenuPopover from "./MenuPopover";
import { chatContext } from "../../AppContext/context";
import { useEffect, useState } from "react";
import ProfileModal from "./ProfileModal";
import { getAllNotifications } from "../../api/notification.api";

const TopBar = ({ setUsersDrawer, handleAccessChat, handleAccessGroup }) => {
  const {
    user,
    profileUser,
    setProfileUser,
    notifications,
    setNotifications,
    selectedChat,
  } = chatContext();

  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const closeMenus = () => setActiveMenu(null);
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = (notification) => {
    if (notification.chat.isGroupChat) handleAccessGroup(notification.chat._id);
    else handleAccessChat(notification.message.senderName._id);
    setNotifications((prev) =>
      prev.filter((n) => n.message.chat._id !== notification.message.chat._id),
    );
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await getAllNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const profileMenuItems = [
    {
      label: "View Profile",
      onClick: () =>
        setProfileUser({
          title: user.username,
          desc: user.email,
          image: user.profile_pic,
        }),
    },
    {
      label: "Log Out",
      danger: true,
      onClick: () => {
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
      },
    },
  ];

  const notificationMenuItems = notifications.length
    ? notifications.map((n) => ({
        label: n.chat.isGroupChat
          ? `New message in ${n.chat.chatName}`
          : `New message from ${n.message.senderName.username}`,
        onClick: () => handleNotificationClick(n),
      }))
    : [];

  return (
    <div className="w-full h-16 bg-white px-4 flex items-center justify-between border-b rounded-2xl">
      <button
        onClick={() => setUsersDrawer(true)}
        className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full"
      >
        <Search size={18} />
        <span className="hidden md:inline">Search User</span>
      </button>

      <h1 className="text-xl font-semibold">Talk-A-Tive App</h1>

      <div className="flex items-center gap-6 relative">
        {/* Bell */}
        <button
          className="relative"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(
              activeMenu === "notification" ? null : "notification",
            );
          }}
        >
          <Bell size={26} />
          {notifications.length > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-4 h-4 px-1 
             bg-red-500 text-white text-xs flex items-center justify-center 
                rounded-full"
            >
              {notifications.length}
            </span>
          )}
        </button>

        <MenuPopover
          isOpen={activeMenu === "notification"}
          items={notificationMenuItems}
          onClose={() => setActiveMenu(null)}
          position="top-10 right-10"
        />

        {/* Avatar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === "profile" ? null : "profile");
          }}
          className="w-10 h-10 rounded-full bg-black flex items-center justify-center overflow-hidden"
        >
          {user?.profile_pic ? (
            <img
              src={user.profile_pic}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          )}
        </button>

        <MenuPopover
          isOpen={activeMenu === "profile"}
          items={profileMenuItems}
          onClose={() => setActiveMenu(null)}
          position="top-10 right-10"
        />
      </div>

      {profileUser && (
        <ProfileModal profileUser={profileUser} isGroupChat={false} />
      )}
    </div>
  );
};

export default TopBar;
