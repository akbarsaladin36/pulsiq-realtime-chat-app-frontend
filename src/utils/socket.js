import { io } from "socket.io-client";
import { getToken } from "./auth";

let socket;

export const connectSocket = () => {
  const token = getToken();

  socket = io("http://localhost:3030", {
    transports: ["websocket", "polling"],
    auth: { token },
  });

  return socket;
};

export const getSocket = () => socket;
