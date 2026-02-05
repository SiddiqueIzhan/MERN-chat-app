import axiosInstance from "./axiosInstance";

export const getAllNotifications = () => {
  return axiosInstance.get("/notifications");
};

export const postNotification = (payload) => {
  return axiosInstance.post("/notifications", payload);
};

export const deleteNotifications = (payload) => {
  return axiosInstance.delete("/notifications", {
    data: payload,
  });
};
