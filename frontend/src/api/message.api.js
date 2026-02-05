import axiosInstance from "./axiosInstance";

export const getAllMessages = (chatId) => {
  return axiosInstance.get(`/message/${chatId}`);
};

export const sendMessage = (payload) => {
  return axiosInstance.post("/message", payload);
};
