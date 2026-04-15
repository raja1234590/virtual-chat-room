import { io } from "socket.io-client";

const ENDPOINT = process.env.REACT_APP_API_URL;

export const socket = io(ENDPOINT, {
  withCredentials: true,
});
