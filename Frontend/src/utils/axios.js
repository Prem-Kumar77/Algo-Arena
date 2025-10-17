import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://algo-arena-eepm-prem-kumars-projects-2383c494.vercel.app/api",
  withCredentials: true,
});

export default axiosInstance;
