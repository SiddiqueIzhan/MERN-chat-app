import axiosInstance from "./axiosInstance";

export const searchUsers = (query) => {
  return axiosInstance.get(`/user?search=${query}`);
};
