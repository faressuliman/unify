import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./axiosInstance";

let socket: Socket | null = null;

const deriveServerOrigin = (): string => {
  try {
    const url = new URL(API_BASE_URL, window.location.origin);
    return `${url.protocol}//${url.host}`;
  } catch {
    return window.location.origin;
  }
};

export const connectSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(deriveServerOrigin(), {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
    auth: { token },
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;
