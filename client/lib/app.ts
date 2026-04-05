import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:8000",
});

// attach token automatically
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }else{
    console.log("No access token found in localStorage");
  }

  return config;
});

export default authApi;