import { chatContext } from "../../AppContext/context";
import React from "react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 cursor-pointer transition"
    >
      {/* Profile Picture */}
      <img
        src={user.profile_pic}
        alt={user.username}
        className="w-8 h-8 rounded-full object-cover"
      />

      {/* User Info */}
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-900">{user.username}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    </div>
  );
};

export default UserListItem;
