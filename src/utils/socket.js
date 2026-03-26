import { io } from "socket.io-client";
import { getToken } from "./auth";

let socket;

export const connectSocket = () => {
  const token = getToken();

  // console.log('SOCKET URL :',import.meta.env.VITE_SOCKET_IO_URL)

  socket = io(import.meta.env.VITE_SOCKET_IO_URL, {
    // transports: ["websocket", "polling"],
    path: "/pulsiq-app/socket.io",
    transports: ["websocket", "polling"],
    auth: { token },
  });

  return socket;
};

export const getSocket = () => socket;
