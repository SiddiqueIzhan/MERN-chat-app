import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { chatContext } from "../../AppContext/context";
import { toast } from "react-toastify";
import UserListItem from "./UserListItem";
import { searchUsers } from "../../api/user.api";
import {
  addUserToGroup,
  changeAdmin,
  createGroupChat,
  removeUserFromGroup,
  renameGroup,
} from "../../api/chat.api";

const GroupChatModal = ({ setOpen, isEdit, selectedChat }) => {
  const {
    user,
    chats,
    setChats,
    groupName,
    setGroupName,
    groupUsers,
    setGroupUsers,
    setFetchAgain,
    fetchAgain,
    setSelectedChat,
  } = chatContext();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState("");

  useEffect(() => {
    if (isEdit) {
      setGroupName(selectedChat.chatName);
      setGroupUsers(
        selectedChat.users.filter(
          (elem) =>
            elem._id !== selectedChat.groupAdmin._id && elem._id !== user._id,
        ),
      );
    }
  }, [selectedChat]);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const res = await searchUsers(value);
      setUsers(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName || groupUsers.length < 2) {
      toast.error("Group name & at least 2 users required");
      return;
    }

    try {
      const res = await createGroupChat({
        groupName,
        userIds: JSON.stringify(groupUsers.map((u) => u._id)),
      });

      setChats([res.data, ...chats]);
      setGroupName("");
      setUsers([]);
      setOpen(false);

      toast.success("Group Chat Created Successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleRenameGroup = async () => {
    if (selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only Admin can rename the group");
      return;
    }

    try {
      const res = await renameGroup({
        chatName: groupName,
        chatId: selectedChat._id,
      });
      setFetchAgain(!fetchAgain);
      toast.success("Group Successfully renamed");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleAddUser = async (u) => {
    const findUser = groupUsers.find((elem) => elem._id === u._id);
    if (findUser) {
      toast.error("User Already Exists");
      return;
    }

    try {
      if (isEdit) {
        if (selectedChat.groupAdmin._id !== user._id) {
          toast.error("Only Admin can add users");
          return;
        }
        const { data } = await addUserToGroup({
          userId: u._id,
          chatId: selectedChat._id,
        });
        setSelectedChat(data);
        setGroupUsers(selectedChat.users.filter((x) => x._id !== user._id));
        toast.success("User Succesfully Added");
      } else setGroupUsers([...groupUsers, u]);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleRemoveUser = async (u) => {
    try {
      if (isEdit) {
        if (u._id === selectedChat.groupAdmin._id) {
          toast.error("Please Add New Admin Before leaving");
          return;
        }
        const { data } = await removeUserFromGroup({
          userId: u._id,
          chatId: selectedChat._id,
        });
        setSelectedChat(data);
        setGroupUsers(
          selectedChat.users.filter(
            (x) => x._id !== u._id && x._id !== user._id,
          ),
        );
        toast.success("User Succesfully Removed");
      } else setGroupUsers(groupUsers.filter((x) => x._id !== u._id));

      if (u._id === user._id) {
        setChats((preVal) => preVal.filter((elem) => elem._id !== u._id));
        setSelectedChat(null);
        setFetchAgain(!fetchAgain);
      }
    } catch (error) {
      if (error.response) toast.error(error.response.data.message);
      else toast.error(error.message);
    }
  };

  const handleExitGroup = async () => {
    try {
      if (selectedChat.groupAdmin._id === user._id) {
        toast.error("Please assign a new admin before leaving");
        return;
      }

      const { data } = await removeUserFromGroup({
        userId: user._id,
        chatId: selectedChat._id,
        newAdminId: selectedChat.groupAdmin._id,
      });

      toast.success("You left the group");
      setOpen(false);
      setChats((prev) => prev.filter((chat) => chat._id !== selectedChat._id));
      setSelectedChat(null);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      if (error.response) toast.error(error.response.data.message);
      else toast.error(error.message);
    }
  };

  const handleChangeAdmin = async () => {
    try {
      const findUser = groupUsers.find((u) => u.username === admin);
      if (!findUser) {
        toast.error("Please Enter Valid Username");
      }
      const { data } = await changeAdmin({
        userId: findUser._id,
        chatId: selectedChat._id,
      });
      toast.success(`Group Admin Changed to ${data.groupAdmin.username}`);
      setSelectedChat((preVal) => ({ ...preVal, groupAdmin: data.groupAdmin }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-105 rounded-xl p-5 relative">
        <button
          onClick={() => {
            setOpen(false);
            setGroupName("");
            setGroupUsers([]);
          }}
          className="absolute top-3 right-3"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Update Group Chat" : "Create Group Chat"}
        </h2>

        {isEdit && selectedChat.groupAdmin._id === user._id && (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter New Admin"
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
              className={`w-4/5 border rounded-lg p-2 mb-3`}
            />
            <button
              className="w-1/5 rounded-lg p-2 mb-3 bg-green-500 text-white"
              onClick={handleChangeAdmin}
            >
              Change
            </button>
          </div>
        )}

        {/* Group Name */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className={`${isEdit ? "w-4/5" : "w-full"} border rounded-lg p-2 mb-3`}
          />
          {isEdit && (
            <button
              className="w-1/5 rounded-lg p-2 mb-3 bg-green-500 text-white"
              onClick={handleRenameGroup}
            >
              Rename
            </button>
          )}
        </div>

        {/* User Search */}
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
          <Search size={18} />
          <input
            type="text"
            placeholder="Add users"
            value={search}
            onChange={handleSearch}
            className="bg-transparent outline-none w-full"
          />
        </div>

        {/* Selected Users */}
        <div className="flex flex-wrap gap-2 mt-3">
          {groupUsers.map((u) => (
            <span
              key={u._id}
              className="bg-blue-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {u.username}
              <X size={14} onClick={() => handleRemoveUser(u)} />
            </span>
          ))}
        </div>

        {/* Search Results */}
        <div className="flex flex-col gap-2 mt-3 max-h-40 overflow-y-auto no-scrollbar">
          {loading && <p className="text-sm text-gray-500">Searching...</p>}
          {users.length ? (
            users.map((u) => (
              <UserListItem
                key={u._id}
                user={u}
                handleFunction={() => handleAddUser(u)}
              />
            ))
          ) : (
            <span className="text-sm text-center">{users.message}</span>
          )}
        </div>

        {/* Create Button */}
        <button
          onClick={() => {
            if (isEdit) handleExitGroup(user);
            else handleCreateGroup();
          }}
          className={`w-full ${isEdit ? "bg-red-500" : "bg-black"} text-white py-2 rounded-lg mt-4`}
        >
          {isEdit ? "Exit Group" : "Create Group"}
        </button>
      </div>
    </div>
  );
};

export default GroupChatModal;
