import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://algo-arena-be3v.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;
