import React, { useState } from "react";
import { chatContext } from "../../AppContext/context";
import GroupChatModal from "./GroupChatModal";

const MyChats = ({
  chats,
  selectedChat,
  handleAccessChat,
  handleAccessGroup,
  loadChats,
}) => {
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const { user } = chatContext();

  const getOtherUser = (chat) => chat.users.find((u) => u._id !== user._id);

  return (
    <>
      <div
        className={`${selectedChat ? "hidden" : "flex"}
            md:flex md:w-1/4 w-full h-[80vh] bg-white rounded-3xl flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">My Chats</h2>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
            onClick={() => {
              setOpenGroupModal(true);
            }}
          >
            + Group
          </button>
        </div>

        {loadChats ? (
          <span className="m-2">Loading Chats...</span>
        ) : (
          <div className="flex-1 overflow-y-scroll no-scrollbar p-2">
            {chats && chats.length > 0 ? (
              chats.map((chat) => {
                const { _id, isGroupChat, chatName, users, lastMessage } = chat;
                const otherUser = !isGroupChat ? getOtherUser(chat) : null;
                return (
                  <div
                    key={_id}
                    onClick={() =>
                      chat.isGroupChat
                        ? handleAccessGroup(_id)
                        : handleAccessChat(otherUser?._id)
                    }
                    className="flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                  >
                    {/* Profile Picture */}
                    <img
                      src={
                        chat.isGroupChat
                          ? "https://cdn-icons-png.flaticon.com/512/681/681494.png"
                          : otherUser?.profile_pic
                      }
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />

                    {/* Chat Info */}
                    <div className="flex flex-col">
                      <p className="font-medium">
                        {isGroupChat ? chatName : otherUser?.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {chat?.lastMessage && lastMessage.text}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400 mt-6">
                No chats available
              </p>
            )}
          </div>
        )}
      </div>
      {openGroupModal && <GroupChatModal setOpen={setOpenGroupModal} />}
    </>
  );
};

export default MyChats;
