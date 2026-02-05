import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
