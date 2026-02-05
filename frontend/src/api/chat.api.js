import axiosInstance from "./axiosInstance.js";

export const accessChat = (payload) => {
  return axiosInstance.post("/chat", payload);
};

export const getAllChats = () => {
  return axiosInstance.get("/chat");
};

export const getAllChatsById = (chatId) => {
  return axiosInstance.get(`/chat/${chatId}`);
};

export const createGroupChat = (payload) => {
  return axiosInstance.post("/chat/group", payload);
};

export const renameGroup = (payload) => {
  return axiosInstance.put("/chat/group/rename", payload);
};

export const addUserToGroup = (payload) => {
  return axiosInstance.put("/chat/group/add", payload);
};

export const removeUserFromGroup = (payload) => {
  return axiosInstance.put("/chat/group/remove", payload);
};

export const changeAdmin = (payload) => {
  return axiosInstance.put("/chat/group/admin", payload);
};

