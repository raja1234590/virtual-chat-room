import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_API_URL
      : process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

console.log("AXIOS BASE URL =>", api.defaults.baseURL);

export default api;
