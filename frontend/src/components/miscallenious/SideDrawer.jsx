import React, { useState } from "react";
import { Search } from "lucide-react";
import { chatContext } from "../../AppContext/context";
import axios from "axios";
import UserListItem from "./UserListItem";
import { searchUsers } from "../../api/user.api";
import { toast } from "react-toastify";

const SideDrawer = ({ setUsersDrawer, handleAccessChat }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, fetchAgain, setFetchAgain } = chatContext();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim() || !user?.token) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      const res = await searchUsers(value);
      setUsers(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFunction = (u) => {
    handleAccessChat(u._id);
    setFetchAgain(!fetchAgain);
    setUsersDrawer(false);
  };

  return (
    <div className="w-full h-full bg-black/50 fixed z-50 top-0 left-0">
      <div className="w-100 max-w-full h-full bg-white p-4 relative flex flex-col gap-4 overflow-y-auto no-scrollbar">
        <h1 className="text-xl font-bold">Search Users</h1>

        <button
          onClick={() => setUsersDrawer(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close search drawer"
        >
          ✕
        </button>

        {/* Search Input */}
        <div className="w-full p-2 flex items-center gap-2 bg-gray-200 rounded-xl">
          <Search />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search User"
            className="outline-none bg-transparent w-full"
            autoComplete="off"
          />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-4 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-10 bg-gray-200 rounded-md" />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && query && users.length > 0 ? (
          <div className="flex flex-col gap-2 mt-2">
            {users.map((u) => (
              <UserListItem
                key={u._id}
                user={u}
                handleFunction={() => handleFunction(u)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No users found.</p>
        )}

        {/* {!loading && query && users.length === 0 && (
          
        )} */}
      </div>
    </div>
  );
};

export default SideDrawer;
